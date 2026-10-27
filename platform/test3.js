// extra v3 checks, injected into test.js through SF.extraTests
module.exports = async ({ ok, $, $$, click, go, setRole, submit, wait, w }) => {
  const SF = w.SF;
  await setRole('participant'); await go('#/season'); ok($('#view').innerHTML.includes('AgroLens'), 'season shows my team');
  await setRole('org'); await go('#/season'); const b = $('[data-act="finalist"]'); const key = b.dataset.key; click(b); await wait(10); ok(!!SF.S.finalists[key], 'org picks a finalist');
  await go('#/council/Samarkand'); $('#s-name').value = 'X'; $('#s-type').value = 'University'; submit($('#seat-form')); await wait(10);
  ok(SF.S.seats.Samarkand.filter(s => s[1] === 'University').length === 2, 'seat added up to 2');
  $('#s-name').value = 'Y'; $('#s-type').value = 'University'; submit($('#seat-form')); await wait(10);
  ok(SF.S.seats.Samarkand.filter(s => s[1] === 'University').length === 2, 'third seat in a sector is refused');
  $('#pb-t').value = 'Buses do not run after 9pm'; submit($('#problem-form')); await wait(10); ok(SF.S.problems.Samarkand[0].t.startsWith('Buses'), 'problem submitted');
  click($('[data-act="tobrief"]')); await wait(10); ok(SF.S.problems.Samarkand.some(p => p.brief), 'problem turned into brief');
  await setRole('participant'); await go('#/startup/AgroLens'); const sw = $('input[data-act="consent"]'); sw.checked = false; sw.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(10);
  ok(SF.S.consent.AgroLens === false, 'consent switched off');
  await setRole('investor'); await go('#/directory'); ok(!$('[data-act="pick"][data-n="AgroLens"]'), 'non-consenting startup cannot be picked');
  await setRole('participant'); await go('#/earn'); click($('[data-act="gigtake"][data-g="g1"]')); await wait(10); ok(SF.S.gigState.g1.st === 1, 'gig assigned');
  click($('[data-act="gigdeliver"][data-g="g1"]')); await wait(10); ok(SF.S.gigState.g1.st === 2, 'gig delivered');
  const e0 = SF.earnings(SF.me('participant').name);
  await setRole('company'); await go('#/earn'); click($('[data-act="gigpay"][data-g="g1"]')); await wait(10); submit($('#pay-form')); await wait(10);
  ok(SF.S.gigState.g1.st === 3 && SF.earnings(SF.me('participant').name) === e0 + 2000000, 'gig paid, earnings grow');
  await setRole('org'); await go('#/directory'); click($('[data-act="reqnext"][data-id="r1"]')); await wait(10); ok(SF.S.requests.find(r => r.id === 'r1').status === 'Sent', 'request status advances');
  await go('#/admin'); ok($('#view').innerHTML.includes('Export regions'), 'CSV buttons present');
  const setLang = async l => { const L = $('#lang'); if (L) { L.value = l; L.dispatchEvent(new w.Event('change', { bubbles: true })); } else click($(`[data-act="setlang"][data-l="${l}"]`)); await wait(10); };
  await setLang('ru'); ok(SF.lang === 'ru', 'language switches'); await setLang('en');
};
