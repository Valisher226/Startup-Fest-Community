// v10 checks: country instances, playbook builder, analytics, language packs, public impact report, launch readiness
const base = require('./test9.js');
module.exports = async (h) => { await base(h); const { ok, $, $$, click, go, setRole, submit, wait, w } = h, SF = w.SF;
  const fill = (id, v) => { const el = $('#' + id); if (!el) throw new Error('missing #' + id); el.value = v; };
  const chg = el => el.dispatchEvent(new w.Event('change', { bubbles: true }));
  // public impact report without signing in
  click($('[data-act="logout"]')); await wait(10); await go('#/impact'); ok(location() === '#/impact' && $$('.kpi').length === 8, 'impact report opens without signing in');
  await go('#/login'); ok(!!$('.impact-link'), 'login page links the impact report');
  await setRole('participant'); await go('#/instances'); ok(location().startsWith('#/noaccess'), 'members cannot open the franchise pages');
  // instances
  await setRole('org'); await go('#/instances'); ok($$('.inst-card').length === 4, '4 country instances');
  click($('[data-act="newinst"]')); await wait(10); fill('in-c', 'Nepal'); fill('in-city', 'Kathmandu'); fill('in-p', 'Sample partner'); fill('in-l', 'Nepali, English'); submit($('#inst-form')); await wait(15);
  const np = SF.S.inst.find(x => x.country === 'Nepal'); ok(np && np.stage === 'Interested' && location().startsWith('#/instance/'), 'a new country is added');
  click($('[data-act="instnext"]')); await wait(10); ok(np.stage === 'Agreement', 'country moves to the next stage');
  const cb = $('input[data-onb="team"]'); cb.checked = true; chg(cb); await wait(10); ok(np.done.includes('team'), 'onboarding item ticked');
  await go('#/instance/kg'); ok($('#view').innerHTML.includes('KYRGYZSTAN'), 'instance page for Kyrgyzstan');
  // playbook
  click($('[data-act="pbfor"]')); await wait(20); ok(location().startsWith('#/playbook') && SF.S.pb.inst === 'kg', 'playbook builder opens for that country');
  const ch = $('input[data-pb="season"]'); ch.checked = false; chg(ch); await wait(10); ok(!SF.playbookText().includes(SF.t('Run the season')), 'a chapter can be left out');
  const note = $('#pbn-day'); note.value = 'Hold it at a factory in Osh'; chg(note); await wait(10); ok($('#pbtext').textContent.includes('Hold it at a factory in Osh'), 'local note appears in the preview');
  const lg = $('#pb-lang'); lg.value = 'ru'; chg(lg); await wait(10); ok(SF.playbookText().includes('Catalyst') && /[а-я]/.test(SF.playbookText()), 'playbook text in Russian');
  click($('[data-act="pbdl"]')); await wait(5); ok(SF.S.audit[0].act === 'Exported a playbook', 'playbook export recorded');
  // analytics
  await go('#/analytics'); ok($$('.funnel').length === 5 && $('#view').innerHTML.includes('Nepal'), 'analytics compares countries and shows the funnel');
  // language pack
  await go('#/langs'); const ky = $('input[data-pack="ky"]'); ky.checked = true; chg(ky); await wait(10); ok(!!$('#langs [data-l="ky"]'), 'enabling Kyrgyz adds a KY button');
  click($('#langs [data-l="ky"]')); await wait(10); ok(SF.lang === 'ky' && $('#tabs').textContent.includes('Панель'), 'menu shows Kyrgyz words');
  click($('#langs [data-l="en"]')); await wait(10);
  // launch readiness
  await go('#/launch'); const r0 = $('#view').querySelector('.sec-h .chip').textContent; click($('[data-act="lstate"][data-n="Load test with 10,000 users at once"]')); await wait(5); click($('[data-act="lstate"][data-n="Load test with 10,000 users at once"]')); await wait(5);
  ok(SF.S.launch['Load test with 10,000 users at once'] === 'done' && $('#view').querySelector('.sec-h .chip').textContent !== r0, 'readiness item moves to done');
  click($('[data-act="loadtest"][data-n="10000"]')); await wait(10); ok(SF.S.loadRuns.length === 1 && $$('#view tbody tr').length === 1, 'load-test simulation adds a result');
  await go('#/admin'); ok($('#view').innerHTML.includes('#/instances'), 'dashboard links the franchise');
  function location() { return w.location.hash; }
};
