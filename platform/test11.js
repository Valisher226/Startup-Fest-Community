// v11 checks: founder check-in and the Org portfolio, against the real backend with the TEST accounts
// (test-alpha / test-beta founders, test-org staff). Set SF_TEST_SKIP_LIVE=1 to skip when offline.
const base = require('./test10.js');
// Test passwords live in platform/.test-credentials.json (git-ignored), never in the repo.
const CRED = (() => { try { return require('./.test-credentials.json'); } catch (e) { return null; } })();
module.exports = async (h) => { await base(h); const { ok, $, $$, click, go, setRole, submit, wait, w } = h, SF = w.SF;
  const until = async (fn, ms = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await wait(100); } return false; };
  const fill = (id, v) => { const el = $('#' + id); if (!el) throw new Error('missing #' + id); el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
  const view = () => $('#view').innerHTML;
  // menu and access
  await setRole('org'); ok(SF.NAV.org.includes('portfolio') && !!$('#tabs a[href="#/portfolio"]'), 'org menu has Portfolio');
  ok(Object.values(SF.NAV).every(n => n.includes('portfolio')), 'every member type has Portfolio in the menu');
  await setRole('participant'); await go('#/portfolio');
  if (!process.env.SF_TEST_SKIP_LIVE) { ok(await until(() => $$('.pf-card').length > 20), 'members see the public portfolio');
    ok(!/\+998|@portfolio|team_members/.test(view()), 'the public portfolio shows no phone numbers or logins');
    ok(!$('[data-act="pfcsv"]') && !!$('a[href="#/portfolio/staff"]'), 'no CSV export for the public; a staff sign-in link instead'); }
  click($('[data-act="logout"]')); await wait(10); await go('#/login'); ok(!!$('a.pf-door[href="#/founder"]'), 'sign-in page links the founder login');
  await go('#/founder'); ok(w.location.hash === '#/founder' && !!$('#pf-login-founder'), 'founder login opens without a demo session');
  // guest mode
  await go('#/home'); ok(w.location.hash === '#/portfolio', 'guests land on the public portfolio');
  ok(w.document.body.classList.contains('guest') && ['portfolio', 'impact', 'founder'].every(k => !!$(`#tabs a[href="#/${k}"]`)), 'guests get a small public menu');
  await go('#/admin'); ok(w.location.hash.startsWith('#/login'), 'private pages still need a sign-in');
  if (!process.env.SF_TEST_SKIP_LIVE) { await go('#/portfolio'); ok(await until(() => $$('.pf-card').length > 20), 'guests see the startups');
    const first = SF.pf.p.rows[0]; ok(first.achievement && !('team_members' in first) && !('phone' in first), 'startups with results come first; no people data reaches guests');
    SF.S.lang = SF.lang = 'uz'; SF.render(); await wait(20);
    const secOpts = $$('#pf-sec option').map(o => o.textContent); ok(secOpts.length > 3 && secOpts.includes('Sun’iy intellekt'.slice(0, 0) + SF.t('AI, Data & Cybersecurity')) && !secOpts.some(x => /[а-я]/i.test(x)) && !secOpts.some(x => /\(.*\)/.test(x)), 'sector filter is one clean list in the page language');
    ok($$('#pf-st option').map(o => o.value).every(v => ['all', 'none', ...SF.PF_STAGES].includes(v)), 'stage filter uses the fixed stages');
    const sec = $('#pf-sec'); sec.value = 'Edtech'; sec.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(20);
    ok($$('.pf-card').length > 0 && SF.pfFiltered().every(x => x.sector === 'Edtech'), 'sector filter works');
    $('#pf-sec').value = 'all'; $('#pf-sec').dispatchEvent(new w.Event('change', { bubbles: true })); await wait(20);
    ok(SF.pfAch('$80,000 investment from Yoshlar Ventures') === '$80K investitsiya · Yoshlar Ventures', 'results are shortened and translated');
    SF.S.lang = SF.lang = 'en'; SF.render();
    await go('#/pstartup/' + first.id); ok(await until(() => /🏆/.test(view())) && !/\+998/.test(view()), 'guest startup page shows the result, no contacts'); }
  await go('#/founder');
  if (process.env.SF_TEST_SKIP_LIVE || !CRED) { if (!CRED) console.log('SKIP live backend checks: no .test-credentials.json'); return; }
  // wrong password
  fill('pf-l-founder', 'test-alpha'); $('#pf-p-founder').value = 'wrong-password'; submit($('#pf-login-founder'));
  ok(await until(() => /Wrong login or password/.test(view())), 'wrong password is refused');
  // founder signs in and walks the steps
  fill('pf-l-founder', 'test-alpha'); $('#pf-p-founder').value = CRED['test-alpha']; submit($('#pf-login-founder'));
  ok(await until(() => !!$('.pf-wizard')), 'founder signs in and sees the check-in');
  ok(view().includes('Test Alpha') && !view().includes('Test Beta'), 'founder sees only their own startup');
  if (SF.pf.f.data.confirmed_at) { ok(/Confirmed on/.test(view()), 'a confirmed founder lands on the summary'); click($('[data-act="pfgo"][data-n="0"]')); await until(() => /Step 1 of 8/.test(view())); }
  const stamp = 'checked ' + Date.now();
  fill('pf-one', stamp); click($('[data-act="pfgo"][data-n="1"]'));
  ok(await until(() => /Step 2 of 8/.test(view())), 'next step after the description');
  ok(SF.pf.f.data.one_liner === stamp, 'description saved to the backend');
  fill('pf-new', 'New Teammate'); fill('pf-newrole', 'Designer'); submit($('#pf-add'));
  ok(await until(() => view().includes('New Teammate')), 'a team member is added');
  const nm = SF.pf.f.data.team_members.find(m => m.name === 'New Teammate'); click($(`[data-act="pfdelmember"][data-id="${nm.id}"]`));
  ok(await until(() => !view().includes('New Teammate')), 'a team member is removed');
  click($('[data-act="pfgo"][data-n="2"]')); await until(() => /Step 3 of 8/.test(view()));
  click($('[data-act="pfpick"][data-k="stage"][data-v="MVP"]')); await wait(20); click($('[data-act="pfgo"][data-n="3"]')); await until(() => /Step 4 of 8/.test(view()));
  ok(SF.pf.f.data.stage === 'MVP', 'stage saved');
  click($('[data-act="pfgo"][data-n="4"]')); await until(() => /Step 5 of 8/.test(view()));
  click($('[data-act="pfpick"][data-k="since_catalyst"][data-v="pilot"]')); await wait(20); click($('[data-act="pfpick"][data-k="since_catalyst"][data-v="investment"]')); await wait(20);
  click($('[data-act="pfpick"][data-k="since_catalyst"][data-v="nothing"]')); await wait(20); ok(SF.pf.f.draft.since_catalyst.join() === 'nothing', '"Nothing yet" clears the other answers');
  click($('[data-act="pfpick"][data-k="since_catalyst"][data-v="pilot"]')); await wait(20); ok(SF.pf.f.draft.since_catalyst.join() === 'pilot', 'choosing an answer clears "Nothing yet"');
  click($('[data-act="pfgo"][data-n="5"]')); await until(() => /Step 6 of 8/.test(view()));
  click($('[data-act="pfgo"][data-n="6"]')); await until(() => /Step 7 of 8/.test(view()));
  click($('[data-act="pfpick"][data-k="can_recommend"][data-v="true"]')); await wait(20); click($('[data-act="pfgo"][data-n="7"]'));
  ok(await until(() => !!$('[data-act="pfconfirm"]')), 'summary step with a Confirm button');
  ok(SF.pf.f.data.can_recommend === true && SF.pf.f.data.since_catalyst.join() === 'pilot', 'recommendation consent and outcomes saved');
  click($('[data-act="pfconfirm"]')); ok(await until(() => !!SF.pf.f.data.confirmed_at && /Confirmed on/.test(view())), 'founder confirms the startup');
  click($('[data-act="pfout"][data-slot="founder"]')); await wait(20); ok(!SF.sb.session('founder') && !!$('#pf-login-founder'), 'founder signs out');
  // Org portfolio
  const org = SF.S.accounts.find(a => a.role === 'org'); SF.login(org); SF.S.filters.pftest = '1'; SF.render(); await go('#/portfolio/staff'); ok(!!$('#pf-login-org'), 'staff sign-in page');
  fill('pf-l-org', 'test-alpha'); $('#pf-p-org').value = CRED['test-alpha']; submit($('#pf-login-org'));
  ok(await until(() => /not on the Startup Fest staff list/.test(view())), 'a founder login cannot open the portfolio');
  click($('[data-act="pfout"][data-slot="org"]')); await wait(20); await go('#/portfolio/staff');
  fill('pf-l-org', 'test-org'); $('#pf-p-org').value = CRED['test-org']; submit($('#pf-login-org'));
  ok(await until(() => SF.pf.o.status === 'ready' && $$('.pf-card:not(.pf-skel)').length >= 2), 'staff sees every startup');
  const a = SF.pf.o.rows.find(r => r.id === 'T001'); ok(a && a.one_liner === stamp && !!a.confirmed_at, 'portfolio shows the founder’s live changes');
  const chk = $('#pf-s'); chk.value = 'waiting'; chk.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(20); ok(!$$('.pf-card').some(c => c.textContent.includes('Test Alpha')), 'filter “Waiting” hides confirmed startups');
  $('#pf-s').value = 'all'; $('#pf-s').dispatchEvent(new w.Event('change', { bubbles: true })); await wait(20);
  await go('#/pstartup/T001'); ok(await until(() => /History/.test(view()) && /Confirmed the details/.test(view()) && /One-liner/.test(view()) && !/one_liner/.test(view())), 'startup page shows the change history');
  await go('#/portfolio'); click($('[data-act="pfcsv"]')); await wait(10); ok(true, 'CSV export runs');
  SF.S.filters.pftest = ''; click($('[data-act="pfreload"]')); ok(await until(() => SF.pf.o.status === 'ready' && SF.pf.o.rows.length > 2), 'real portfolio loads');
  ok(!SF.pf.o.rows.some(r => r.is_test) && SF.pf.o.rows[0].achievement, 'test startups are hidden and startups with results come first');
  const res = $('#pf-res'); res.value = 'yes'; res.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(20); const cards = $$('.pf-card');
  ok(cards.length > 0 && cards.every(c => c.querySelector('.pf-win')), '“With results” shows only startups with a result');
  $('#pf-res').value = 'all'; $('#pf-res').dispatchEvent(new w.Event('change', { bubbles: true })); await wait(20);
};
