// Functional walkthrough of a packaged build: node test.js <path to index.html>
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const file = process.argv[2], dir = path.dirname(file);
const html = fs.readFileSync(file, 'utf8').replace(/<script src="assets\/js\/([^"]+)"><\/script>/g, (_, f) =>
  f === 'qrcode.min.js' ? '<script>window.QRCode=function(el){el.textContent="QR"}</script>' : `<script>${fs.readFileSync(path.join(dir, 'assets/js', f), 'utf8')}</script>`);
const errors = [];
const vc = new (require('jsdom').VirtualConsole)(); vc.on('jsdomError', e => { if (!/Not implemented: HTMLCanvasElement/.test(e.message)) console.error(e.message, process.env.STACK ? (e.detail && e.detail.stack || e.stack || '').split('\n').slice(0,4).join(' | ') : ''); });
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/index.html', pretendToBeVisual: true, virtualConsole: vc });
const w = dom.window, d = w.document;
w.addEventListener('error', e => errors.push(e.message));
w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:demo';
const wait = ms => new Promise(r => setTimeout(r, ms));
const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const click = el => { if (!el) throw new Error('missing element'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const go = async h => { w.location.hash = h; await wait(20); };
const setRole = async r => { const s = $('#role'); s.value = r; s.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(20); };
const submit = f => f.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) process.exitCode = 1; };
(async () => {
  await wait(50);
  const SF = w.SF; SF.S.lang = SF.lang = 'en'; SF.render();
  ok($('#view').innerHTML.length > 500, 'home renders');
  for (const r of Object.keys(SF.NAV)) { await setRole(r); for (const v of SF.NAV[r]) { await go('#/' + v); ok($('#view').innerHTML.length > 200, `${r} → ${v} renders`); } }
  for (const h of ['#/events/e1', '#/catalyst/b1', '#/pilot/p1', '#/roadmap']) { await go(h); ok($('#view').innerHTML.length > 200, h + ' renders'); }
  // participant registers for an event
  await setRole('participant'); await go('#/events/e1'); const pts0 = SF.me().points;
  click($('[data-act="reg"]')); await wait(10); ok(SF.S.reg.participant.includes('e1') && SF.me().points === pts0 + 10, 'register gives +10');
  // org checks the participant in by typing the ID
  await setRole('org'); await go('#/events/e1'); $('#ci-id').value = 'sf-27-00317'; submit($('#checkin-form')); await wait(10);
  ok(SF.S.checkins.e1.includes('SF-27-00317') && SF.me('participant').points === pts0 + 25, 'check-in by ID gives the member +15');
  ok(SF.badges('participant').includes('First check-in'), 'badge awarded');
  // participant applies to brief b2
  await setRole('participant'); await go('#/catalyst/b2'); click($('[data-act="apply"]')); await wait(10); submit($('#apply-form')); await wait(10);
  const app = SF.S.pipeline.find(p => p.mine && p.brief === 'b2'); ok(!!app && app.stage === 0, 'application created');
  // company accepts it
  await setRole('company'); await go('#/catalyst/b2'); click($(`[data-act="decide"][data-p="${app.id}"][data-ok="1"]`)); await wait(10); submit($('#decide-form')); await wait(10);
  ok(app.stage === 1 && app.note, 'company accepts with a note');
  ok(SF.S.notifs.some(n => n.role === 'participant' && /selected/.test(n.t)), 'participant notified');
  // advance to pilot, run weeks, milestones, update, contract
  await go('#/catalyst/b2'); click($(`[data-act="advance"][data-p="${app.id}"]`)); await wait(10); click($(`[data-act="advance"][data-p="${app.id}"]`)); await wait(10);
  ok(app.stage === 3, 'moved to 100-day pilot');
  await go('#/pilot/' + app.id); for (let i = 0; i < 3; i++) { click($('[data-act="week"]')); await wait(5); } ok(app.day === 22, 'weeks advance the day counter');
  const cb = $('input[data-act="milestone"][data-i="0"]'); cb.checked = true; cb.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(10); ok(app.done.includes(0), 'milestone ticked');
  $('#up-t').value = 'Pilot running in 2 bazaars'; submit($('#update-form')); await wait(10); ok(app.updates.length === 1, 'pilot update posted');
  const before = SF.metrics().valueUZS; $('#c-v').value = '95 000 000'; submit($('#contract-form')); await wait(10);
  ok(app.stage === 4 && SF.metrics().valueUZS === before + 95000000, 'contract recorded and counted');
  ok(SF.badges('participant').includes('Pilot partner'), 'participant gets Pilot partner badge');
  // gig post + take
  await go('#/earn'); click($('[data-act="newgig"]')); await wait(10); $('#p-title').value = 'Landing page'; submit($('#gig-form')); await wait(10); ok(SF.S.gigs[0].title === 'Landing page', 'gig posted');
  await setRole('participant'); await go('#/earn'); const gid = SF.S.gigs[0].id; click($(`[data-act="take"][data-g="${gid}"],[data-act="gigtake"][data-g="${gid}"]`)); await wait(10);
  ok(SF.S.applied.length === 1 || (SF.S.gigState && SF.S.gigState[gid].st === 1), 'gig taken');
  // join with role-specific fields
  if (!SF.signupSteps) { await go('#/me'); click($('[data-act="join"]')); await wait(10); const jr = $('#j-role'); jr.value = 'investor'; jr.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(5);
  ok(!!$('#jf-ticket'), 'investor-specific fields appear'); if ($('#j-first')) { $('#j-first').value = 'Test'; $('#j-last').value = 'Investor'; submit($('#join4-form')); } else { $('#j-name').value = 'Test Investor'; submit($('#join-form')); } await wait(20);
  ok(SF.S.role === 'investor' && SF.me().name === 'Test Investor' && SF.me().points === 20, 'new ID created for investor'); } else await setRole('investor');
  // shortlist
  await go('#/directory'); click($('[data-act="pick"]')); await wait(5); click($('[data-act="shortlist"]')); await wait(10); ok(SF.S.notifs.some(n => n.role === 'org' && /shortlist/.test(n.t)), 'shortlist request reaches org');
  // messages
  await go('#/messages'); $('#msg').value = 'Hello'; submit($('#compose')); await wait(10); ok(SF.S.threads.find(t => t.id === SF.S.cur).msgs.some(m => m.t === 'Hello'), 'message sent');
  // bell
  click($('#bell')); await wait(5); ok(!$('#bellpanel').hidden && $('#bellpanel').innerHTML.includes('note'), 'notifications panel opens');
  if (process.env.EXTRA) await require(process.env.EXTRA)({ ok, $, $$, click, go, setRole, submit, wait, w });
  // reset
  click($('[data-act="reset"]')); await wait(5); click($('[data-act="doreset"]')); await wait(10); ok(SF.S.applied.length === 0 && SF.S.pipeline.length === 8, 'reset clears state');
  ok(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  process.exit();
})().catch(e => { console.log('FAIL exception', e.message, e.stack.split('\n')[1]); console.log(errors); process.exit(1); });
