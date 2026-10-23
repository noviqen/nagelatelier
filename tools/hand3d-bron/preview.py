"""blender -b -P preview.py -- mesh.ply uit_prefix  : rendert 4 aanzichten om de vorm te beoordelen."""
import bpy, sys, math, mathutils
argv = sys.argv[sys.argv.index("--") + 1:]
ply, pre = argv[0], argv[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.ply_import(filepath=ply)
ob = bpy.context.selected_objects[0]
bpy.ops.object.shade_smooth()
ob.scale = (0.01, 0.01, 0.01)  # mm -> dm-ish units voor de scene

mat = bpy.data.materials.new("huid"); mat.use_nodes = True
b = mat.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value = (0.86, 0.62, 0.50, 1)
b.inputs["Roughness"].default_value = 0.5
b.inputs["Subsurface Weight"].default_value = 0.25
b.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.2)
b.inputs["Subsurface Scale"].default_value = 0.03
ob.data.materials.append(mat)

sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "GPU"
prefs = bpy.context.preferences.addons["cycles"].preferences
for t in ("OPTIX", "CUDA"):
    try:
        prefs.compute_device_type = t; prefs.get_devices()
        if any(d.type == t for d in prefs.devices):
            for d in prefs.devices: d.use = True
            break
    except Exception: pass
sc.cycles.samples = 64
sc.render.resolution_x = 700; sc.render.resolution_y = 900
sc.render.film_transparent = False
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.97, 0.93, 0.91, 1)
w.node_tree.nodes["Background"].inputs[1].default_value = 0.35

def light(loc, e, size=3):
    ld = bpy.data.lights.new("l", "AREA"); ld.energy = e; ld.size = size
    lo = bpy.data.objects.new("l", ld); sc.collection.objects.link(lo); lo.location = loc
    lo.rotation_euler = (mathutils.Vector((0, 0.3, 0)) - mathutils.Vector(loc)).to_track_quat("-Z", "Y").to_euler()
light((2, 1, 4), 260); light((-3, 2, 1), 80)

cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 70
target = mathutils.Vector((-0.02, 0.85, 0))
views = {"rug": (0, 0.6, 4.6), "zij": (4.4, 0.9, 0.6), "schuin": (2.2, -0.6, 3.6), "tip": (0.6, 4.2, 1.8)}
for naam, pos in views.items():
    cam.location = pos
    cam.rotation_euler = (target - mathutils.Vector(pos)).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = f"{pre}_{naam}.png"
    bpy.ops.render.render(write_still=True)
