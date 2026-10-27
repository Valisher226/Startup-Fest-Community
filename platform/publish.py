# Copy a built version to the Mac and refresh the index files: python3 publish.py v6 "one-line summary"
import sys, os, shutil, re, subprocess
ver, summary = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
D = os.environ.get('SF_DEMO_DIR', os.path.expanduser('~/Downloads/04 Projects/Startup Fest (2025-2026)/Platform Demo'))
dst = os.path.join(D, ver)
if os.path.exists(dst): shutil.rmtree(dst)
shutil.copytree(os.path.join(here, 'build', ver), dst)
logins = os.path.join(here, 'src', ver, 'LOGINS.txt')
if os.path.exists(logins): shutil.copy(logins, os.path.join(D, 'LOGINS.txt'))
# START HERE.html: new version on top, only it tagged Newest
p = os.path.join(D, 'START HERE.html'); s = open(p).read()
s = s.replace('<span class="tag">Newest</span>', '')
s = re.sub(r'<a class="v" href="%s/[^"]*"><b>%s</b>.*?</a>\n' % (ver, ver), '', s)
link = f'<a class="v" href="{ver}/StartupFest-Platform-{ver}/index.html"><b>{ver}</b><span class="tag">Newest</span><p>{summary}</p></a>\n'
i = s.index('<a class="v"'); s = s[:i] + link + s[i:]
if 'LOGINS.txt' not in s: s = s.replace('<a class="v" href="ROADMAP.md">', '<a class="v" href="LOGINS.txt"><b>Logins for every member type</b><p>Email and password for Participant, Mentor, Investor, Company, Small business, Scouting partner and Org team.</p></a>\n<a class="v" href="ROADMAP.md">')
open(p, 'w').write(s)
# README.txt
n = int(ver[1:])
open(os.path.join(D, 'README.txt'), 'w').write(f'''STARTUP FEST PLATFORM: DEMO VERSIONS

To show the demo: open {ver} (the newest). To send it to someone, send {ver}/StartupFest-Platform-{ver}.zip.
They unzip it and double-click index.html. No internet or installation is needed.

From v6 the demo opens on a Sign in page. Every member type has its own login.
The email and password for each member type are in LOGINS.txt (here, and inside every zip from v6).

Folders
- v1 … {ver} ........... each version as a ready-to-open folder plus a .zip to send
- LOGINS.txt ......... the login and password for every member type
- ROADMAP.md ......... the plan from v1 to v10
- START HERE.html .... a page linking all versions and the roadmap (open it in a browser)
- _source ............ the code and the build and test scripts used to make new versions

All people, startups, companies and numbers in the demo are sample data, except 14 regions and the $410K in Catalyst deals.
''')
# _source sync
S = os.path.join(D, '_source (for building new versions)')
for f in os.listdir(here):
    full = os.path.join(here, f)
    if os.path.isfile(full) and f.endswith(('.js', '.py', '.json', '.sh')) and not f.startswith(('keys', 'miss', 'new')) and f != 'package-lock.json': shutil.copy(full, os.path.join(S, f))
for sub in ['src', 'vendor', 'img']:
    subprocess.run(['rsync', '-a', '--delete', os.path.join(here, sub) + '/', os.path.join(S, sub) + '/'], check=True)
print('published', ver, 'to', dst)
