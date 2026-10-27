// Records every key passed to SF.t while crawling all routes, then adds literal t('…') strings from the source
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path');
const file = process.argv[2], dir = path.dirname(file), keys = new Set();
const html = fs.readFileSync(file, 'utf8').replace(/<script src="assets\/js\/([^"]+)"><\/script>/g, (_, f) => f === 'qrcode.min.js' ? '<script>window.QRCode=function(){}</script>' : `<script>${fs.readFileSync(path.join(dir, 'assets/js', f), 'utf8')}</script>`);
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/index.html' }); const w = dom.window; w.scrollTo = () => {};
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await wait(30); const SF = w.SF, t0 = SF.t; SF.t = (s, v) => { if (typeof s === 'string') keys.add(s); return t0(s, v); };
  const routes = ['home', 'events', 'catalyst', 'earn', 'directory', 'messages', 'community', 'me', 'admin', 'season', 'roadmap', 'plans', 'partner', 'content'];
  (SF.GUILDS||[]).forEach(g => SF.slug && routes.push('guild/' + SF.slug(g.n)));
  SF.EVENTS.forEach(e => routes.push('events/' + e.id)); SF.BRIEFS.forEach(b => routes.push('catalyst/' + b.id)); SF.S.pipeline.forEach(p => routes.push('pilot/' + p.id));
  SF.REGIONS.forEach(r => routes.push('council/' + encodeURIComponent(r))); SF.STARTUPS.forEach(s => routes.push('startup/' + encodeURIComponent(s.n)));
  routes.push('login', 'signup', 'account', 'hours', 'judge', 'peers', 'fellows', 'deals', 'deal/AgroLens', 'deal/BozorPay', 'deal/Ustoz.ai', 'raise', 'verify', 'battle', 'users', 'permissions', 'audit', 'backend', 'privacy', 'noaccess/x', 'tickets', 'tg', 'notify', 'payments', 'impact', 'instances', 'instance/kg', 'playbook', 'analytics', 'langs', 'launch'); Object.keys(SF.ROLES).forEach(r => routes.push('login/' + r));
  for (const r of Object.keys(SF.ROLES)) { SF.S.role = r; if (SF.loginAs) SF.loginAs(r); for (const h of routes) { w.location.hash = '#/' + h; await wait(3); SF.render(); }
    if (r === 'org') for (const ct of ['week','calendar','cards']) for (const cs of ['mon','wed','thu']) { SF.S.filters.ctab = ct; SF.S.filters.cslot = cs; w.location.hash = '#/content'; await wait(3); SF.render(); }
    ['join', 'newgig', 'newbrief', 'reset', 'bell'].forEach(a => { try { SF.A[a]({}); } catch (e) {} SF.closeModal(); });
    try { if (SF.ALL_PLANS) SF.ALL_PLANS.forEach(p => { SF.A.choose({ plan: p.id }); SF.closeModal(); }); if (SF.A.composer) {} SF.A.apply({ b: 'b1' }); SF.A.decide({ p: 'p2', ok: '1' }); SF.A.decide({ p: 'p2', ok: '0' }); SF.A.gigpay({ g: 'g3' }); } catch (e) {} SF.closeModal();
    if (SF.signupSteps && r !== 'org') { for (let i = 0; i < 7; i++) { SF.S.signup = { step: i, type: r, data: { 'su-dob': '2011-01-01', 'su-mail': 'a@b.uz', 'su-first': 'A', 'su-last': 'B', 'su-org': 'X', 'su-langs': ['Uzbek'], 'su-topics': ['Pricing'], 'su-needs': ['Delivery'], 'su-c-tg': true, 'su-judge': 'Yes', 'su-host': 'Maybe later', 'su-kind': 'Angel' }, done: [] }; w.location.hash = '#/signup'; await wait(3); SF.render(); } SF.S.signup = { step: 0, type: '', data: {}, done: [] }; }
    try { SF.A.book({ m: 'Bekzod Tursunov', s: 'Mon 19:00' }); SF.A.recogapply({ l: 'Champion' }); SF.A.renew({ id: 'fa1' }); SF.A.forgot({}); SF.A.peerjoin({ g: 'pg1' }); SF.A.ohdone({ id: 'bk1' }); } catch (e) {} SF.closeModal();
    Object.keys(SF.ROLE_FIELDS).forEach(k => SF.ROLE_FIELDS[k].forEach(f => { keys.add(f.label); f.ph && keys.add(f.ph); (f.options || []).forEach(o => keys.add(o)); })); }
  // data strings that render through t()
  SF.LEVELS.forEach(l => keys.add(l[0])); Object.keys(SF.BADGES).forEach(b => keys.add(b)); SF.STAGES.forEach(s => keys.add(s)); SF.MILESTONES.forEach(s => keys.add(s));
  SF.GIGS.forEach(g => { keys.add(g.title); keys.add(g.kind); keys.add(g.pay); }); Object.values(SF.ROLES).forEach(r => keys.add(r.label));
  ['Paid', 'New member', 'My startup', 'Gig', 'Job', 'Requested', 'Curating', 'Sent', 'Start curating', 'Send shortlist', 'Due', 'To', 'year', 'month', 'event', 'shortlist', 'free'].forEach(k => keys.add(k));
  (SF.CARD_TEMPLATES||[]).forEach(x=>keys.add(x[1])); (SF.SLOTS||[]).forEach(x=>{keys.add(x[1]);keys.add(x[2]);});
  (SF.ALL_PLANS||[]).forEach(p => { keys.add(p.name); p.perks.forEach(x => keys.add(x)); }); (SF.TRACK_OPTIONS||[]).forEach(x=>keys.add(x)); (SF.LEVEL_OPTIONS||[]).forEach(x=>keys.add(x)); (SF.PROGRAMS||[]).forEach(x=>keys.add(x)); (SF.PAY_METHODS||[]).forEach(x=>keys.add(x[1]));
  // literal t('...') strings in the source
  for (const f of fs.readdirSync(path.join(dir, 'assets/js'))) { if (f === 'qrcode.min.js') continue; const src = fs.readFileSync(path.join(dir, 'assets/js', f), 'utf8');
    for (const m of src.matchAll(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g)) keys.add(m[1].replace(/\\'/g, "'"));
    for (const m of src.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)) keys.add(m[1]); }
  const list = [...keys].filter(k => k && /[A-Za-z]/.test(k) && !/^SF-|^#\//.test(k)).sort();
  fs.writeFileSync('keys.json', JSON.stringify(list, null, 1)); console.log(list.length, 'keys');
  process.exit();
})();
