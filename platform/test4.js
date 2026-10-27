// v4 checks: plans, checkout, invoices, guild pages, partner panel, site-style sign-up
const base = require('./test3.js');
module.exports = async (h) => { await base(h); const { ok, $, click, go, setRole, submit, wait, w } = h, SF = w.SF;
  await setRole('company'); await go('#/plans'); ok($('#view').innerHTML.includes('Guild anchor'), 'plans page lists tiers');
  click($('[data-act="choose"][data-plan="anchor"]')); await wait(10); ok(!!$('#checkout-form'), 'checkout opens');
  $('#ck-inn').value = '123'; submit($('#checkout-form')); await wait(10); ok(!!$('#checkout-form'), 'bad INN is refused');
  $('#ck-inn').value = '302456789'; submit($('#checkout-form')); await wait(10);
  ok(SF.S.subs['AgroVodiy Holding'].plan === 'anchor' && SF.S.invoices[0].status === 'Paid', 'paid by Click: plan active, invoice paid');
  await go('#/partner'); ok($('#view').innerHTML.includes('AgroVodiy Holding') && $('#view').innerHTML.includes('INV-2026-047'), 'partner panel shows invoices');
  click($('[data-act="payinv"][data-id="INV-2026-047"]')); await wait(10); $('#ck-inn').value = '302456789'; submit($('#checkout-form')); await wait(10);
  ok(SF.S.invoices.find(i => i.id === 'INV-2026-047').status === 'Paid', 'due invoice paid from the partner panel');
  await go('#/guild/agritech-and-food'); ok($('#view').innerHTML.includes('Khorezm Agro Cluster'), 'guild page shows members');
  await go('#/plans'); click($('[data-act="choose"][data-plan="sme-access"]')); await wait(10); const r = w.document.querySelector('input[name=ck-m][value=invoice]'); r.checked = true;
  $('#ck-org').value = 'Non Uyi bakery'; $('#ck-inn').value = '301111111'; submit($('#checkout-form')); await wait(10);
  ok(SF.S.invoices[0].to === 'Non Uyi bakery' && SF.S.invoices[0].status === 'Due', 'bank transfer creates a due invoice');
  await setRole('org'); await go('#/admin'); ok($('#view').innerHTML.includes(SF.t('Revenue overview')), 'revenue section on dashboard');
  const mp = $(`[data-act="markpaid"][data-id="${SF.S.invoices[0].id}"]`); click(mp); await wait(10); ok(SF.S.invoices[0].status === 'Paid', 'org marks invoice paid');
  await setRole('investor'); await go('#/directory'); const n0 = SF.S.invoices.length; click($('[data-act="pick"]')); await wait(5); click($('[data-act="shortlist"]')); await wait(10);
  ok(SF.S.invoices.length === n0 + 1 && SF.S.requests[0].status === 'Requested', 'shortlist creates a request and a fee invoice');
  if (!SF.signupSteps) { await setRole('participant'); click($('#joinbtn')); await wait(10); ok(!!$('#jx-track') && !!$('#j-phone'), 'site-style sign-up has track and phone');
  $('#j-first').value = 'Kamola'; $('#j-last').value = 'Yusupova'; $('#jx-why').value = 'I want to build an agri startup with my classmates.'; submit($('#join4-form')); await wait(20);
  ok(SF.me().name === 'Kamola Yusupova' && SF.me().fields.trackArea, 'new participant saved with site fields'); }
  click($('[data-act="burger"]')); await wait(5); ok($('#top').classList.contains('open'), 'mobile menu opens');
};
