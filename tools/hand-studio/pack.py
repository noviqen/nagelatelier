"""Leest de EXR-lagen en schrijft per aanzicht+vorm één PNG (3 tegels) + kader-info."""
import sys, json, glob, os
import numpy as np, OpenEXR
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
def lees(fn):
    with OpenEXR.File(fn) as f:
        ch = f.channels()
        if "RGBA" in ch: a = np.asarray(ch["RGBA"].pixels, np.float32)
        else: a = np.stack([np.asarray(ch[c].pixels, np.float32) for c in "RGBA"], -1)
    return a
meta = {}
for kf in glob.glob(f"{src}/kaders_*.json"): meta.update(json.load(open(kf)))
info = {}
for key, kader in meta.items():
    d = lees(f"{src}/{key}_data.exr"); sh = lees(f"{src}/{key}_shade.exr"); sp = lees(f"{src}/{key}_spec.exr"); sm = lees(f"{src}/{key}_specmat.exr")
    al = np.clip(d[..., 3], 0, 1); safe = np.maximum(al, 1e-4)[..., None]
    uv = np.clip(d[..., :3] / safe, 0, 1)
    alS = np.maximum(sh[..., 3], 1e-4)[..., None]
    shade = sh[..., 0] / alS[..., 0]; spec = sp[..., 0] / np.maximum(sp[..., 3], 1e-4); specm = sm[..., 0] / np.maximum(sm[..., 3], 1e-4)
    m = al > 0.6
    norm = np.percentile(shade[m], 92) if m.any() else 1.0
    shade /= norm; spec /= norm; specm /= norm
    h, w = al.shape
    u16 = np.round(uv[..., 0] * 65535).astype(np.uint32); v16 = np.round(uv[..., 1] * 65535).astype(np.uint32)
    fid = np.clip(np.floor(uv[..., 2] * 8), 0, 7).astype(np.uint8)
    t1 = np.stack([u16 >> 8, u16 & 255, v16 >> 8], -1).astype(np.uint8)
    t2 = np.stack([v16 & 255, np.round(al * 255), np.where(al > 0.02, fid * 40 + 20, 0)], -1).astype(np.uint8)
    enc = lambda x, mx: np.round(np.sqrt(np.clip(x / mx, 0, 1)) * 255)
    t3 = np.stack([enc(shade, 1.6), enc(spec, 6.0), enc(specm, 3.0)], -1).astype(np.uint8)
    for t in (t1, t2, t3): t[al <= 0.002] = 0
    out = np.concatenate([t1, t2, t3], 1)
    Image.fromarray(out[::-1] if False else out).save(f"{dst}/{key}.png", optimize=True)
    info[key] = {"kader": kader, "w": w, "h": h}
json.dump(info, open(f"{dst}/nagels_{list(meta)[0].split('_',1)[1]}.json", "w"))
print("ingepakt", len(info))
