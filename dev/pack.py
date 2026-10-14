# 打包技能：dist/haitao-ppt-maker.zip（用 zipfile，保证中文文件名在 Windows 上不乱码）
import os, zipfile, sys
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
src = os.path.join(root, 'haitao-ppt-maker')
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
out = os.path.join(root, 'dist', 'haitao-ppt-maker.zip')
n = 0
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(src):
        for f in fs:
            if f.startswith('.') or f.endswith('.map'):
                continue
            p = os.path.join(d, f)
            z.write(p, os.path.join('haitao-ppt-maker', os.path.relpath(p, src)))
            n += 1
print(out, n, '个文件', round(os.path.getsize(out) / 1024), 'KB')
