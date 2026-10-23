#!/bin/bash
B=~/apps/blender-5.0.1-linux-x64/blender
cd /home/roy/projects/app-development/nagelatelier-test/hand3d
for k in $(python3 -c "import json;print(' '.join(json.load(open('outlines.json'))))"); do
  $B -b -P studio.py -- nails h2.ply h2_frames.json outlines.json /tmp/render keys=$k 2>&1 | grep -E "Traceback|Error:"
done
$B -b -P studio.py -- base h2.ply h2_frames.json outlines.json /tmp/render samples=320 2>&1 | grep -E "Traceback|Error:"
echo ALLES KLAAR
