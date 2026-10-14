#!/bin/bash
# 用法：dev/shot.sh samples/zhengwu/样张.html → 同目录 shots/ 每页 PNG + sheet.png（无头 Chrome 截图，动效直接显示终态）
f="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"; d="$(dirname "$f")/shots"; rm -rf "$d"; mkdir -p "$d"
n=$(grep -o 'class="s"' "$f" | wc -l | tr -d ' ')
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for i in $(seq 1 $n); do
  "$C" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1280,720 --virtual-time-budget=1500 \
    --screenshot="$d/p$(printf %02d $i).png" "file://$f?still#$i" >/dev/null 2>&1
done
magick montage "$d"/p*.png -tile 3x -geometry 640x360+6+6 -background '#444' "$d/sheet.png"
echo "$d/sheet.png ($n 页)"
