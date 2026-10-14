#!/bin/bash
# 用法：dev/qlshot.sh 风格id → samples/<id>/ql/ 每页用 macOS Quick Look 渲染 pptx 的截图 + sheet.png
s="$1"; d="samples/$s/ql"; rm -rf "$d"; mkdir -p "$d/tmp"
n=$(node -e "console.log(require('./dev/sample.json').slides.length)")
for i in $(seq 1 $n); do
  node haitao-ppt-maker/scripts/build.js dev/sample.json --style $s --out "$d/tmp" --name p$(printf %02d $i) --format pptx --page $i >/dev/null
done
qlmanage -t -s 1280 -o "$d" "$d"/tmp/*.pptx >/dev/null 2>&1
magick montage "$d"/p*.pptx.png -tile 3x -geometry 640x360+6+6 -background '#444' "$d/sheet.png" 2>/dev/null
rm -rf "$d/tmp"; echo "$d/sheet.png"
