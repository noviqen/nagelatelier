"""blender -b -P build.py -- hand.ply hand_nails.json uitmap
Decimeert, bakt AO (GPU) in vertexkleur, meet nagelbedden en schrijft hand.bin + hand.json voor de web-app."""
import bpy, bmesh, sys, json, math, struct, mathutils
from mathutils.bvhtree import BVHTree
argv = sys.argv[sys.argv.index("--") + 1:]
ply, nj, out = argv
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.ply_import(filepath=ply)
ob = bpy.context.selected_objects[0]; bpy.context.view_layer.objects.active = ob
ob.scale = (0.001,) * 3
bpy.ops.object.transform_apply(scale=True)
n0 = len(ob.data.polygons)
m = ob.modifiers.new("dec", "DECIMATE"); m.ratio = min(1.0, 62000 / n0)
bpy.ops.object.modifier_apply(modifier="dec")
m = ob.modifiers.new("sm", "CORRECTIVE_SMOOTH"); m.iterations = 3; m.scale = 1.0; m.smooth_type = "LENGTH_WEIGHTED"
bpy.ops.object.modifier_apply(modifier="sm")
bpy.ops.object.shade_smooth()
print("tris", len(ob.data.polygons), "verts", len(ob.data.vertices))

# --- AO bakken naar vertexkleur ---
sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.device = "GPU"
prefs = bpy.context.preferences.addons["cycles"].preferences
for t in ("OPTIX", "CUDA"):
    try:
        prefs.compute_device_type = t; prefs.get_devices()
        if any(d.type == t for d in prefs.devices):
            for d in prefs.devices: d.use = True
            print("device", t); break
    except Exception: pass
sc.cycles.samples = 256
w = bpy.data.worlds.new("w"); sc.world = w
w.light_settings.distance = 0.035
mat = bpy.data.materials.new("m"); mat.use_nodes = True; ob.data.materials.append(mat)
ca = ob.data.color_attributes.new("ao", "BYTE_COLOR", "POINT")
ob.data.color_attributes.active_color = ca
sc.render.bake.target = "VERTEX_COLORS"
bpy.ops.object.bake(type="AO")

# --- nagelbedden meten ---
me = ob.data
bvh = BVHTree.FromObject(ob, bpy.context.evaluated_depsgraph_get())
nails = json.load(open(nj))
V = mathutils.Vector
frames = []
for n in nails:
    tip = V(n["tip"]) * 0.001; a = V(n["as"]).normalized(); d = V(n["dorsaal"]).normalized(); r = n["r"] * 0.001
    l = a.cross(d).normalized()
    width = 2 * r * 0.80; s = width / 100.0          # meter per nagel-eenheid
    F = tip + a * (r * 0.3); C = F - a * (112 * s)
    hit = bvh.ray_cast(C + d * 0.03, -d)
    O = hit[0] if hit[0] else C + d * r
    grid = []
    ys = list(range(20, -181, -10)); xs = list(range(-60, 61, 10))
    for y in ys:
        row = []
        for x in xs:
            p = O + l * (x * s) + a * (-y * s)
            h = bvh.ray_cast(p + d * 0.03, -d, 0.06)
            row.append(None if h[0] is None else round((0.03 - h[3]) / s, 2))
        grid.append(row)
    frames.append({"naam": n["naam"], "o": list(O), "l": list(l), "a": list(a), "d": list(d), "s": s, "xs": xs, "ys": ys, "h": grid})

# --- binair wegschrijven: posities (uint16 gekwantiseerd), normalen (int8), ao (uint8), indices (uint16) ---
me.calc_loop_triangles()
nv = len(me.vertices); assert nv < 65535, nv
co = [v.co for v in me.vertices]
lo = V((min(c.x for c in co), min(c.y for c in co), min(c.z for c in co)))
hi = V((max(c.x for c in co), max(c.y for c in co), max(c.z for c in co)))
ext = hi - lo
ao = [0] * nv
for i, c in enumerate(ca.data): ao[i] = int(round(c.color[0] * 255))
with open(out + "/hand.bin", "wb") as f:
    for c in co:
        f.write(struct.pack("<HHH", *[int(round((c[k] - lo[k]) / ext[k] * 65535)) for k in range(3)]))
    for v in me.vertices:
        nn = v.normal
        f.write(struct.pack("<bbb", *[max(-127, min(127, int(round(nn[k] * 127)))) for k in range(3)]))
    f.write(bytes(ao))
    pad = (-f.tell()) % 2; f.write(b"\0" * pad)
    for t in me.loop_triangles:
        f.write(struct.pack("<HHH", *t.vertices))
json.dump({"nv": nv, "nt": len(me.loop_triangles), "lo": list(lo), "ext": list(ext), "nails": frames}, open(out + "/hand.json", "w"))
print("klaar", nv, len(me.loop_triangles))
