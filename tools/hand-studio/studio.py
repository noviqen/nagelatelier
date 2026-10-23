"""Fotostudio voor de Nagelatelier-hand (Blender/Cycles, GPU).
blender -b -P studio.py -- <modus> <hand.ply> <frames.json> <outlines.json> <uitmap> [opties]
modi:
  preview  : mooie proefrenders met rode nagels (alle aanzichten)
  base     : hand zonder nagels per huidskleur en aanzicht  (PNG RGBA)
  nails    : per vorm/lengte en aanzicht de nagel-lagen (EXR): data, shade, spec, specmat
"""
import bpy, sys, json, math, os
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:]
MODE, PLY, FRAMES, OUTL, OUT = argv[:5]
OPTS = dict(a.split("=", 1) for a in argv[5:] if "=" in a)
os.makedirs(OUT, exist_ok=True)

HUID = ["#F5D9C6", "#EBC2A4", "#D9A47E", "#BC8259", "#8F5C3C", "#5F3B27"]
W, H = 1080, 1350
VIEWS = {
    # naam: (camera, doel, brandpunt)
    "boven":  ((0.004, 0.058, 0.56), (-0.006, 0.088, 0.0), 85),
    "schuin": ((0.25, -0.03, 0.27), (-0.005, 0.105, 0.0), 58),
    "toppen": ((0.012, 0.128, 0.3), (-0.007, 0.148, 0.0), 85),
}

def lin(hexc):
    h = hexc.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1.0,)

# ---------- scène ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "GPU"
prefs = bpy.context.preferences.addons["cycles"].preferences
for t in ("OPTIX", "CUDA"):
    try:
        prefs.compute_device_type = t; prefs.get_devices()
        if any(d.type == t for d in prefs.devices):
            for d in prefs.devices: d.use = (d.type == t)
            break
    except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.film_transparent = True
sc.cycles.use_denoising = True
for dn in ("OPTIX", "OPENIMAGEDENOISE"):
    try: sc.cycles.denoiser = dn; break
    except Exception: pass
sc.view_settings.view_transform = OPTS.get("vt", "AgX")
try: sc.view_settings.look = "AgX - Medium High Contrast"
except Exception: pass
sc.cycles.max_bounces = 8
sc.view_settings.exposure = float(OPTS.get("exp", "-2.4"))

# wereld: zacht warm-wit studiolicht
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes["Background"]; bg.inputs[0].default_value = (0.95, 0.92, 0.9, 1); bg.inputs[1].default_value = 0.06

def area(name, loc, target, energy, sx, sy, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, "AREA"); ld.energy = energy; ld.shape = "RECTANGLE"; ld.size = sx; ld.size_y = sy; ld.color = color
    ob = bpy.data.objects.new(name, ld); sc.collection.objects.link(ob); ob.location = loc
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return ob
# striplamp boven (glansstreep op de nagels), grote softbox links, invul rechts, randlicht achter
area("strip", (-0.05, 0.12, 0.42), (0, 0.1, 0), 6, 0.9, 0.09)
area("softbox", (-0.3, 0.02, 0.34), (0, 0.1, 0), 22, 0.8, 0.8, (1.0, 0.96, 0.92))
area("invul", (0.4, 0.15, 0.2), (0, 0.1, 0), 1.6, 0.6, 0.6, (0.96, 0.97, 1.0))
area("rand", (0.12, 0.42, 0.02), (0, 0.1, 0), 7, 0.5, 0.15)

# ---------- hand ----------
bpy.ops.wm.ply_import(filepath=PLY)
hand = bpy.context.selected_objects[0]; hand.name = "hand"
bpy.context.view_layer.objects.active = hand
hand.scale = (0.001,) * 3
bpy.ops.object.transform_apply(scale=True)
bpy.ops.object.shade_smooth()
zmin = min(v.co.z for v in hand.data.vertices)

def huid_mat(hexc):
    m = bpy.data.materials.new("huid"); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; Lk = nt.links
    b = N["Principled BSDF"]
    base = lin(hexc)
    rood = (base[0] * 0.92, base[1] * 0.55, base[2] * 0.52, 1)
    # kleurvariatie: bolle delen (knokkels, toppen) iets roder, plus vlekkerigheid
    geo = N.new("ShaderNodeNewGeometry")
    ramp = N.new("ShaderNodeValToRGB"); ramp.color_ramp.elements[0].position = 0.5; ramp.color_ramp.elements[1].position = 0.56
    Lk.new(geo.outputs["Pointiness"], ramp.inputs[0])
    tc = N.new("ShaderNodeTexCoord")
    nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 90; nz.inputs["Detail"].default_value = 3
    Lk.new(tc.outputs["Object"], nz.inputs["Vector"])
    rd = N.new("ShaderNodeVertexColor"); rd.layer_name = "rood"
    mixf = N.new("ShaderNodeMath"); mixf.operation = "MULTIPLY_ADD"
    Lk.new(rd.outputs["Color"], mixf.inputs[0]); mixf.inputs[1].default_value = 0.6
    sub = N.new("ShaderNodeMath"); sub.operation = "MULTIPLY"; sub.inputs[1].default_value = 0.25
    Lk.new(nz.outputs["Fac"], sub.inputs[0]); Lk.new(sub.outputs[0], mixf.inputs[2])
    mx = N.new("ShaderNodeMix"); mx.data_type = "RGBA"
    mx.inputs[6].default_value = base; mx.inputs[7].default_value = rood
    Lk.new(mixf.outputs[0], mx.inputs[0])
    Lk.new(mx.outputs[2], b.inputs["Base Color"])
    b.inputs["Subsurface Weight"].default_value = 1.0
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.38, 0.18)
    b.inputs["Subsurface Scale"].default_value = 0.0035
    b.inputs["Roughness"].default_value = 0.46
    b.inputs["Specular IOR Level"].default_value = 0.42
    b.inputs["Sheen Weight"].default_value = 0.08
    # poriën + fijne structuur
    p1 = N.new("ShaderNodeTexNoise"); p1.inputs["Scale"].default_value = 2600; p1.inputs["Detail"].default_value = 2
    v1 = N.new("ShaderNodeTexVoronoi"); v1.inputs["Scale"].default_value = 1500
    Lk.new(tc.outputs["Object"], p1.inputs["Vector"]); Lk.new(tc.outputs["Object"], v1.inputs["Vector"])
    add = N.new("ShaderNodeMath"); add.operation = "ADD"
    Lk.new(p1.outputs["Fac"], add.inputs[0]); Lk.new(v1.outputs["Distance"], add.inputs[1])
    bump = N.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.22; bump.inputs["Distance"].default_value = 0.00012
    Lk.new(add.outputs[0], bump.inputs["Height"]); Lk.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m

# roodheid: knokkels, gewrichten, vingertoppen
import numpy as _np
_fr = json.load(open(FRAMES))
_pts = []
for f in _fr:
    J = [Vector(q) * 0.001 for q in f.get("joints", [])]
    for k, q in enumerate(J): _pts.append((q, 0.0065 if k < 3 else 0.008, 0.55 if k < 3 else 0.75))
    if "o" in f: _pts.append((Vector(f["o"]) * 0.001, 0.0028, 0.55))
_co = _np.array([v.co[:] for v in hand.data.vertices])
_r = _np.zeros(len(_co))
for q, rad, st in _pts:
    d2 = ((_co - _np.array(q[:])) ** 2).sum(1)
    _r += st * _np.exp(-d2 / (2 * rad * rad))
_r = _np.clip(_r, 0, 1)
_ca = hand.data.color_attributes.new("rood", "FLOAT_COLOR", "POINT")
_ca.data.foreach_set("color", _np.repeat(_r, 4).astype(_np.float32))
hand.data.materials.append(huid_mat(HUID[int(OPTS.get("huid", 1))]))

# ondergrond die alleen schaduw vangt
bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0.08, zmin - 0.0004))
vloer = bpy.context.active_object; vloer.is_shadow_catcher = True

# ---------- nagels ----------
frames = json.load(open(FRAMES)); outl = json.load(open(OUTL))
bvh = BVHTree.FromObject(hand, bpy.context.evaluated_depsgraph_get())

def span(pts, y):
    xl, xr = 1e9, -1e9
    for i in range(len(pts)):
        x1, y1 = pts[i]; x2, y2 = pts[(i + 1) % len(pts)]
        if (y1 <= y <= y2) or (y2 <= y <= y1):
            t = 0 if y2 == y1 else (y - y1) / (y2 - y1); x = x1 + (x2 - x1) * t
            xl = min(xl, x); xr = max(xr, x)
    return (xl, xr) if xl <= xr else None

THICK = 0.00055
def bouw_nagel(fr, key, fid):
    L = outl[key]["L"]; pts = outl[key]["pts"]
    O = Vector(fr["o"]) * 0.001; l = Vector(fr["l"]); a = Vector(fr["a"]); d = Vector(fr["d"]); s = fr["s"] * 0.001
    def P(x, y): return O + l * (x * s) + a * (-y * s)
    def huid_h(x, y):
        h = bvh.ray_cast(P(x, y) + d * 0.02, -d, 0.04)
        return None if h[0] is None else 0.02 - h[3]
    ys_fit = [y for y in range(-12, -64, -4)]
    hs = [(y, huid_h(0, y)) for y in ys_fit]; hs = [(y, h) for y, h in hs if h is not None]
    n = len(hs); sx = sum(y for y, _ in hs); sy = sum(h for _, h in hs); sxx = sum(y * y for y, _ in hs); sxy = sum(y * h for y, h in hs)
    slope = (n * sxy - sx * sy) / (n * sxx - sx * sx); icpt = (sy - slope * sx) / n
    def ztop(x, y):
        yc = min(-14, max(y, -60))
        hc = huid_h(0, yc); hx = huid_h(x, yc)
        trans = (hx - hc) if (hx is not None and hc is not None) else -((x / 50) ** 2) * 9 * s
        z = icpt + slope * y + trans * 0.92 + 0.00003
        if y < -14:
            hh = huid_h(x, y)
            if hh is not None: z = max(z, hh + 0.00003)
        return z + THICK
    yTop = -L - 12; HH = L + 34
    R, C = 70, 22
    rows = []
    for r in range(R + 1):
        y = -L + 0.4 + (14 - 0.8 + L) * r / R
        sp = span(pts, y)
        if sp: rows.append((y, sp))
    me = bpy.data.meshes.new(f"nagel{fid}")
    verts, faces, uvs = [], [], []
    top, bot = [], []
    for y, (xl, xr) in rows:
        rt, rb = [], []
        for c in range(C + 1):
            x = xl + (xr - xl) * c / C
            z = ztop(x, y)
            base = P(x, y)
            rt.append(len(verts)); verts.append(base + d * z); uvs.append(((x + 50) / 100, (y - yTop) / HH))
            rb.append(len(verts)); verts.append(base + d * (z - THICK)); uvs.append(((x + 50) / 100, (y - yTop) / HH))
        top.append(rt); bot.append(rb)
    for r in range(len(top) - 1):
        for c in range(C):
            faces.append((top[r][c], top[r][c + 1], top[r + 1][c + 1], top[r + 1][c]))
            faces.append((bot[r][c], bot[r + 1][c], bot[r + 1][c + 1], bot[r][c + 1]))
    last = len(top) - 1; ring = []
    for c in range(C + 1): ring.append((top[0][c], bot[0][c]))
    for r in range(1, last + 1): ring.append((top[r][C], bot[r][C]))
    for c in range(C - 1, -1, -1): ring.append((top[last][c], bot[last][c]))
    for r in range(last - 1, 0, -1): ring.append((top[r][0], bot[r][0]))
    for k in range(len(ring)):
        t1, b1 = ring[k]; t2, b2 = ring[(k + 1) % len(ring)]
        faces.append((t1, b1, b2, t2))
    me.from_pydata([tuple(v) for v in verts], [], faces)
    uvl = me.uv_layers.new(name="UVMap")
    for poly in me.polygons:
        for li in poly.loop_indices:
            uvl.data[li].uv = uvs[me.loops[li].vertex_index]
    for poly in me.polygons: poly.use_smooth = True
    ob = bpy.data.objects.new(f"nagel{fid}", me); sc.collection.objects.link(ob)
    ob["fid"] = fid
    return ob

def nagels(key):
    for o in [o for o in sc.objects if o.name.startswith("nagel")]: bpy.data.objects.remove(o)
    return [bouw_nagel(fr, key, f) for f, fr in enumerate(frames)]

def mat_principled(name, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    for k, v in kw.items(): b.inputs[k].default_value = v
    return m

def mat_data():
    m = bpy.data.materials.new("data"); m.use_nodes = True; nt = m.node_tree; N = nt.nodes
    for n in list(N): N.remove(n)
    out = N.new("ShaderNodeOutputMaterial"); em = N.new("ShaderNodeEmission"); uv = N.new("ShaderNodeUVMap"); uv.uv_map = "UVMap"
    sep = N.new("ShaderNodeSeparateXYZ"); comb = N.new("ShaderNodeCombineXYZ")
    attr = N.new("ShaderNodeAttribute"); attr.attribute_type = "OBJECT"; attr.attribute_name = "fid"
    div = N.new("ShaderNodeMath"); div.operation = "MULTIPLY_ADD"; div.inputs[1].default_value = 0.125; div.inputs[2].default_value = 0.0625
    nt.links.new(uv.outputs[0], sep.inputs[0]); nt.links.new(sep.outputs[0], comb.inputs[0]); nt.links.new(sep.outputs[1], comb.inputs[1])
    nt.links.new(attr.outputs["Fac"], div.inputs[0]); nt.links.new(div.outputs[0], comb.inputs[2])
    nt.links.new(comb.outputs[0], em.inputs[0]); em.inputs[1].default_value = 1.0
    nt.links.new(em.outputs[0], out.inputs[0])
    return m

# ---------- camera ----------
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.sensor_fit = "AUTO"; cam.data.sensor_width = 36
def zet_view(v):
    loc, tgt, lens = VIEWS[v]
    cam.location = loc; cam.data.lens = lens
    cam.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.view_layer.update()

def render(path, fmt="PNG", samples=256, border=None):
    sc.cycles.samples = samples
    s = sc.render.image_settings
    if fmt == "EXR":
        s.file_format = "OPEN_EXR"; s.color_depth = "16"; s.exr_codec = "ZIP"; s.color_mode = "RGBA"
    else:
        s.file_format = "PNG"; s.color_mode = "RGBA"; s.color_depth = "8"
    if border:
        sc.render.use_border = True; sc.render.use_crop_to_border = True
        sc.render.border_min_x, sc.render.border_min_y, sc.render.border_max_x, sc.render.border_max_y = border
    else:
        sc.render.use_border = False
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)

def nagel_kader(obs):
    xs, ys = [], []
    for o in obs:
        for v in o.data.vertices:
            p = world_to_camera_view(sc, cam, o.matrix_world @ v.co); xs.append(p.x); ys.append(p.y)
    m = 0.012
    return (max(0, min(xs) - m), max(0, min(ys) - m), min(1, max(xs) + m), min(1, max(ys) + m))

views = OPTS.get("views", ",".join(VIEWS)).split(",")
if MODE == "preview":
    obs = nagels(OPTS.get("key", "almond_middel"))
    nm = mat_principled("lak", **{"Base Color": lin(OPTS.get("kleur", "#A3001E")), "Roughness": 0.3, "Coat Weight": 1.0, "Coat Roughness": 0.03})
    for o in obs: o.data.materials.append(nm)
    for v in views:
        zet_view(v); render(f"{OUT}/preview_{v}.png", samples=int(OPTS.get("samples", 160)))
elif MODE == "base":
    for t in OPTS.get("huiden", "0,1,2,3,4,5").split(","):
        hand.data.materials.clear(); hand.data.materials.append(huid_mat(HUID[int(t)]))
        for v in views:
            zet_view(v); render(f"{OUT}/base_{v}_{t}.png", samples=int(OPTS.get("samples", 384)))
elif MODE == "nails":
    keys = OPTS.get("keys", ",".join(outl)).split(",")
    hand.is_holdout = True
    vloer.hide_render = True
    kader = {}
    for key in keys:
        obs = nagels(key)
        for v in views:
            zet_view(v); b = nagel_kader(obs); kader[f"{v}_{key}"] = b
            sc.view_settings.view_transform = "Standard"
            for laag, mat, smp in (("data", mat_data(), 24),
                                   ("shade", mat_principled("wit", **{"Base Color": (1, 1, 1, 1), "Roughness": 1.0, "Specular IOR Level": 0.0}), 192),
                                   ("spec", mat_principled("glans", **{"Base Color": (0, 0, 0, 1), "Roughness": 1.0, "Specular IOR Level": 0.0, "Coat Weight": 1.0, "Coat Roughness": 0.025}), 192),
                                   ("specmat", mat_principled("mat", **{"Base Color": (0, 0, 0, 1), "Roughness": 1.0, "Specular IOR Level": 0.0, "Coat Weight": 1.0, "Coat Roughness": 0.38}), 128)):
                for o in obs: o.data.materials.clear(); o.data.materials.append(mat)
                sc.cycles.use_denoising = laag != "data"
                sc.render.filter_size = 0.7 if laag == "data" else 1.5
                render(f"{OUT}/{v}_{key}_{laag}.exr", fmt="EXR", samples=smp, border=b)
    json.dump(kader, open(f"{OUT}/kaders_{keys[0]}.json", "w"))
print("STUDIO KLAAR")
