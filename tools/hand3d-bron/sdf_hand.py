"""Boetseert een rechterhand (rugzijde +Z, vingers +Y, duim -X) als signed distance field
en zet hem met marching cubes om naar een mesh (PLY) + nagel-assen (JSON).
Eenheden: millimeter."""
import json, sys, math
import numpy as np
from skimage.measure import marching_cubes

VOX = float(sys.argv[1]) if len(sys.argv) > 1 else 0.45
OUT = sys.argv[2] if len(sys.argv) > 2 else "hand_raw.ply"

def nrm(v):
    v = np.asarray(v, float); return v / np.linalg.norm(v)

def rot(v, axis, ang):
    axis = nrm(axis); v = np.asarray(v, float)
    return v * math.cos(ang) + np.cross(axis, v) * math.sin(ang) + axis * np.dot(axis, v) * (1 - math.cos(ang))

# ---------- primitieven (gevectoriseerd; p = (...,3)) ----------
def round_cone(p, a, b, r1, r2, dorsal=None, flat=1.0):
    """iq's round cone, met optioneel afgeplatte doorsnede (dorsaal/palmair geschaald)."""
    a = np.asarray(a, float); b = np.asarray(b, float)
    ax = nrm(b - a); L = np.linalg.norm(b - a)
    if dorsal is None: dorsal = np.array([0, 0, 1.0])
    d = nrm(dorsal - ax * np.dot(dorsal, ax)); l = np.cross(ax, d)
    q = p - a
    u = q @ ax; v = q @ l; w = (q @ d) / flat
    # in lokaal stelsel: a=(0,0,0), b=(L,0,0)
    ba = np.array([L, 0, 0.0]); l2 = L * L; rr = r1 - r2; a2 = l2 - rr * rr; il2 = 1.0 / l2
    y = u * L; z = y - l2
    x2 = (v * l2) ** 2 + (w * l2) ** 2 + ((u * l2) - L * y) ** 2
    y2 = y * y * l2; z2 = z * z * l2
    k = np.sign(rr) * rr * rr * x2
    d1 = np.sqrt(x2 + z2) * il2 - r2
    d2 = np.sqrt(x2 + y2) * il2 - r1
    d3 = (np.sqrt(np.maximum(x2 * a2 * il2, 0)) + y * rr) * il2 - r1
    out = np.where(np.sign(z) * a2 * z2 > k, d1, np.where(np.sign(y) * a2 * y2 < k, d2, d3))
    return out * (0.5 + 0.5 * flat)  # ruwe correctie voor de schaal

def ellipsoid(p, c, r):
    q = (p - np.asarray(c, float)) / np.asarray(r, float)
    k0 = np.linalg.norm(q, axis=-1); k1 = np.linalg.norm(q / np.asarray(r, float), axis=-1)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-6)

def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)

# ---------- anatomie ----------
Z = np.array([0, 0, 1.0])
FINGERS = {  # naam: (MCP x, MCP y, spreiding rad, lengtes, radii (MCP,PIP,DIP,tip))
    "wijs":   (-24.5, 86, -0.10, (41, 25, 21.5), (9.3, 8.4, 7.6, 7.0)),
    "midden": (-4.5, 90.5, -0.025, (46, 29, 22.5), (9.6, 8.7, 7.8, 7.2)),
    "ring":   (15.5, 87, 0.065, (43, 27.5, 22), (8.9, 8.1, 7.3, 6.8)),
    "pink":   (32.0, 79, 0.175, (34, 20, 19.5), (7.7, 7.0, 6.4, 6.0)),
}
BEND = (0.05, 0.09, 0.05)  # MCP, PIP, DIP (relaxed, elegant)

chains = {}
for name, (x, y, spread, lens, radii) in FINGERS.items():
    d = nrm([math.sin(spread), math.cos(spread), 0])
    lat = nrm(np.cross(d, Z))
    pts = [np.array([x, y, 0.5])]
    dirs = []
    for seg, (ln, b) in enumerate(zip(lens, BEND)):
        d = rot(d, lat, -b)  # buig naar palmzijde
        dirs.append(d)
        pts.append(pts[-1] + d * ln)
    chains[name] = (pts, radii, dirs)

# duim: CMC -> MCP -> IP -> tip, nagel kijkt schuin opzij
TH_DORSAL = nrm([-0.62, 0.0, 0.78])
th_pts = [np.array([-19.0, 16.0, -5.5])]
th_dirs = [nrm([-0.56, 0.80, 0.12]), nrm([-0.40, 0.90, 0.17]), nrm([-0.27, 0.95, 0.15])]
th_lens = (42, 31, 26.5)
for dd, ln in zip(th_dirs, th_lens):
    th_pts.append(th_pts[-1] + dd * ln)
th_radii = (12.5, 10.6, 9.6, 8.6)

def sdf(p):
    # pols / onderarm (afgeplat)
    d = round_cone(p, [0, 6, -1], [0, -150, -2], 25.5, 28.5, Z, 0.66)
    # middenhandsbeentjes
    mc = [(-17, -24.5, 86), (-5.5, -4.5, 90.5), (6, 15.5, 87), (16, 32, 79)]
    for wx, mx, my in mc:
        d = smin(d, round_cone(p, [wx, 10, -1.5], [mx, my - 3, 0.2], 11.5, 10.2, Z, 0.70), 11.0)
    # vulling palm + duimmuis + pinkmuis
    d = smin(d, ellipsoid(p, [3, 44, -2.0], [29, 36, 9.5]), 18.0)
    d = smin(d, ellipsoid(p, [-24, 30, -8.5], [15, 23, 11]), 12.0)
    d = smin(d, ellipsoid(p, [27, 38, -6.5], [10.5, 27, 10]), 12.0)
    # knokkels (subtiel)
    for name, (x, y, *_r) in FINGERS.items():
        d = smin(d, ellipsoid(p, [x, y - 1, 4.6], [7.0, 6.2, 3.6]), 4.0)
    # vingers: gelijkmatig taps, geen worstjes
    for name, (pts, radii, dirs) in chains.items():
        f = None
        for s_ in range(3):
            seg = round_cone(p, pts[s_], pts[s_ + 1], radii[s_], radii[s_ + 1], Z, 0.82)
            f = seg if f is None else smin(f, seg, 0.7)
        d = smin(d, f, 6.5)
    # duim
    f = None
    for s in range(3):
        seg = round_cone(p, th_pts[s], th_pts[s + 1], th_radii[s], th_radii[s + 1], TH_DORSAL, 0.84)
        f = seg if f is None else smin(f, seg, 0.9)
    d = smin(d, f, 9.0)
    return d

# ---------- raster ----------
lo = np.array([-78, -152, -32.0]); hi = np.array([58, 205, 26.0])
nx, ny, nz = ((hi - lo) / VOX).astype(int) + 1
xs = lo[0] + np.arange(nx) * VOX; ys = lo[1] + np.arange(ny) * VOX; zs = lo[2] + np.arange(nz) * VOX
vol = np.empty((nx, ny, nz), np.float32)
X, Zg = np.meshgrid(xs, zs, indexing="ij")
for j in range(ny):
    p = np.stack([X, np.full_like(X, ys[j]), Zg], -1)
    vol[:, j, :] = sdf(p)
    if j % 100 == 0: print(f"rij {j}/{ny}", flush=True)
# platte snede onderaan de arm
vol[:, :2, :] = np.maximum(vol[:, :2, :], 0.5)

verts, faces, normals, _ = marching_cubes(vol, 0.0, spacing=(VOX, VOX, VOX))
verts += lo
print("verts", len(verts), "faces", len(faces))

def write_ply(fn, v, f):
    with open(fn, "wb") as fh:
        fh.write(f"ply\nformat binary_little_endian 1.0\nelement vertex {len(v)}\nproperty float x\nproperty float y\nproperty float z\nelement face {len(f)}\nproperty list uchar int vertex_indices\nend_header\n".encode())
        fh.write(v.astype("<f4").tobytes())
        rec = np.empty(len(f), dtype=[("n", "u1"), ("a", "<i4"), ("b", "<i4"), ("c", "<i4")])
        rec["n"] = 3; rec["a"] = f[:, 0]; rec["b"] = f[:, 2]; rec["c"] = f[:, 1]
        fh.write(rec.tobytes())
write_ply(OUT, verts, faces)

# nagel-assen: per vinger (duim, wijs, midden, ring, pink) distale as + dorsale richting + breedte
nails = []
def nail_axis(pts, radii, dorsal):
    a = nrm(pts[3] - pts[2])
    d = nrm(dorsal - a * np.dot(dorsal, a))
    return a, d
for name, pts, radii, dors in [("duim", th_pts, th_radii, TH_DORSAL)] + [(n, *chains[n][:2], Z) for n in ["wijs", "midden", "ring", "pink"]]:
    a, d = nail_axis(pts, radii, dors)
    nails.append({"naam": name, "tip": (pts[3]).tolist(), "as": a.tolist(), "dorsaal": d.tolist(), "r": radii[3]})
json.dump(nails, open(OUT.replace(".ply", "_nails.json"), "w"), indent=1)
print("klaar")
