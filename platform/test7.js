// v7 checks: verification, deal rooms, fundraising, VC Battle, intros and investments
const base = require('./test6.js');
module.exports = async (h) => { await base(h); const { ok, $, $$, click, go, setRole, submit, wait, w } = h, SF = w.SF;
  const fill = (id, v) => { const el = $('#' + id); if (!el) throw new Error('missing #' + id); el.value = v; };
  // verified investor requests access to AgroLens
  await setRole('investor'); await go('#/deals'); ok($$('.round-card').length === 6 && $$('.pipe-st').length === 5, 'deal flow lists 6 rounds and the pipeline');
  click($('[data-act="dealreq"][data-n="AgroLens"]')); await wait(10); ok(SF.S.deal.AgroLens.access['Dilnoza Karimova'] === 'requested', 'investor requests data-room access');
  await go('#/deal/AgroLens'); ok(!$('#commit-form') && $('#view').innerHTML.includes(SF.t('Waiting for the founder')), 'deal room stays closed until the founder approves');
  // founder approves and answers
  await setRole('participant'); await go('#/raise'); click($('[data-act="dealgrant"][data-w="Dilnoza Karimova"]')); await wait(10); ok(SF.S.deal.AgroLens.access['Dilnoza Karimova'] === 'granted', 'founder approves the investor');
  const cb = $('input[data-act="readyitem"][data-k="cap"]'); cb.checked = true; cb.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(10); ok(SF.S.ready.AgroLens.includes('cap'), 'readiness checklist item ticked');
  click($('[data-act="updoc"][data-doc="Cap table"]')); await wait(10); ok(SF.S.deal.AgroLens.docs.includes('Cap table'), 'founder uploads the cap table');
  const af = $('.answer-form'); af.querySelector('input').value = 'Our own team, 2 pilots per region.'; submit(af); await wait(10); ok(SF.S.deal.AgroLens.qa.every(q => q.a), 'founder answers investor questions');
  // investor signs NDA, asks, commits, logs investment
  await setRole('investor'); await go('#/deal/AgroLens'); $('#nda-ok').checked = true; submit($('#nda-form')); await wait(10); ok(SF.S.deal.AgroLens.nda.includes('Dilnoza Karimova') && !!$('#commit-form'), 'NDA signed opens the deal room');
  fill('qa-q', 'What is churn after one season?'); submit($('#qa-form')); await wait(10); ok(SF.S.deal.AgroLens.qa.length === 3, 'investor asks a question');
  const c0 = SF.committed('AgroLens'); fill('cm-a', '25 000'); submit($('#commit-form')); await wait(10); ok(SF.committed('AgroLens') === c0 + 25000 && SF.stageOf('AgroLens') === 'Committed', 'soft commitment recorded');
  const v0 = SF.metrics().valueUZS; click($('[data-act="loginv"]')); await wait(10); submit($('#inv-form')); await wait(10);
  ok(SF.S.investments[0].startup === 'AgroLens' && SF.metrics().valueUZS === v0 + 25000 * SF.FX, 'investment logged and counted in value to members');
  // verification queue
  click($('[data-act="logout"]')); await wait(10); await setRole('org'); await go('#/deals'); click($('[data-act="vipok"][data-n="Orient Ventures"]')); await wait(10); ok(SF.isVip('Orient Ventures'), 'org verifies an investor');
  // VC Battle
  await go('#/battle'); click($('[data-act="bopen"]')); await wait(10); ok(SF.S.battle.open, 'org opens voting');
  await setRole('participant'); await go('#/battle'); click($('[data-act="bvote"][data-n="AgroLens"]')); await wait(10); ok(SF.S.battle.votes[0].AgroLens === 1 && !$('[data-act="bvote"]'), 'member votes once per round');
  await setRole('investor'); await go('#/battle'); fill('bp-agrolens', '300000'); fill('bp-suvchi', '100000'); submit($('#bpick-form')); await wait(10); ok(SF.S.battle.picks[0]['Samarkand Angels'].AgroLens === 300000, 'investor team saves picks');
  await setRole('org'); await go('#/battle'); for (let i = 0; i < 4; i++) { click($('[data-act="bsim"]')); await wait(5); click($('[data-act="bclose"]')); await wait(5); if (i < 3) { click($('[data-act="bnext"]')); await wait(5); click($('[data-act="bopen"]')); await wait(5); } }
  click($('[data-act="bfinish"]')); await wait(10); ok(SF.S.battle.done && SF.S.battle.winner, 'four rounds run and a winner announced: ' + SF.S.battle.winner);
  await go('#/admin'); ok($('#view').innerHTML.includes('#/deals') && $('#view').innerHTML.includes('#/battle'), 'dashboard links capital and VC Battle');
  // a non-verified investor (new sign-up path is covered in v6) cannot open rooms
  SF.S.vip['Dilnoza Karimova'].status = 'Submitted'; await setRole('investor'); await go('#/deal/BozorPay'); ok(!$('#commit-form'), 'unverified investors cannot open data rooms'); SF.S.vip['Dilnoza Karimova'].status = 'Verified';
};
