# Package a version: python3 package.py <srcdir> <version> <dest root>
# srcdir contains: index.body.html (body markup), app.css, *.js (loaded in order listed in scripts.txt)
import sys, os, shutil, zipfile
src, ver, dest = sys.argv[1], sys.argv[2], sys.argv[3]
here = os.path.dirname(os.path.abspath(__file__))
name = f'StartupFest-Platform-{ver}'
out = os.path.join(dest, ver, name)
if os.path.exists(out): shutil.rmtree(out)
os.makedirs(os.path.join(out, 'assets', 'css')); os.makedirs(os.path.join(out, 'assets', 'js'))
shutil.copytree(os.path.join(here, 'vendor', 'fonts'), os.path.join(out, 'assets', 'fonts'))
shutil.copytree(os.path.join(here, 'img'), os.path.join(out, 'assets', 'img'))
fcss = os.path.join(src, 'fonts.css') if os.path.exists(os.path.join(src, 'fonts.css')) else os.path.join(here, 'vendor', 'fonts.local.css')
shutil.copy(fcss, os.path.join(out, 'assets', 'css', 'fonts.css'))
if os.path.isdir(os.path.join(src, 'img')):
    for f in os.listdir(os.path.join(src, 'img')): shutil.copy(os.path.join(src, 'img', f), os.path.join(out, 'assets', 'img', f))
shutil.copy(os.path.join(here, 'vendor', 'qrcode.min.js'), os.path.join(out, 'assets', 'js', 'qrcode.min.js'))
shutil.copy(os.path.join(src, 'app.css'), os.path.join(out, 'assets', 'css', 'app.css'))
scripts = [l.strip() for l in open(os.path.join(src, 'scripts.txt')) if l.strip()]
for s in scripts: shutil.copy(os.path.join(src, s), os.path.join(out, 'assets', 'js', s))
body = open(os.path.join(src, 'index.body.html')).read()
tags = '\n'.join(f'<script src="assets/js/{s}"></script>' for s in ['qrcode.min.js'] + scripts)
html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Startup Fest Platform</title>
<link rel="icon" href="assets/img/logo.png">
<link rel="stylesheet" href="assets/css/fonts.css">
<link rel="stylesheet" href="assets/css/app.css">
</head>
<body>
{body}
{tags}
</body>
</html>
'''
open(os.path.join(out, 'index.html'), 'w').write(html)
for extra in ['README.txt', 'LOGINS.txt']:
    p = os.path.join(src, extra)
    if os.path.exists(p): shutil.copy(p, os.path.join(out, extra))
zp = os.path.join(dest, ver, name + '.zip')
if os.path.exists(zp): os.remove(zp)
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(out):
        for f in files:
            if f.startswith('.'): continue
            full = os.path.join(root, f); z.write(full, os.path.relpath(full, os.path.join(dest, ver)))
print('packaged', out, os.path.getsize(zp)//1024, 'KB zip')
