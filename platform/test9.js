// v9 checks: tickets with card + SMS payment, promo codes, refunds, Telegram bot and login, offline check-in, notifications, payments
const base = require('./test8.js');
module.exports = async (h) => { await base(h); const { ok, $, $$, click, go, setRole, submit, wait, w } = h, SF = w.SF;
  const fill = (id, v) => { const el = $('#' + id); if (!el) throw new Error('missing #' + id); el.value = v; };
  // buy a paid ticket for the Catalyst showcase as the mentor: choose → card → SMS
  await setRole('mentor'); await go('#/events/e5'); click($('[data-act="buyticket"]')); await wait(10); ok(!!$('#tk-form') && $$('input[name=tk-type]').length === 3, 'ticket checkout offers 3 ticket types');
  fill('tk-promo', 'STUDENT50'); click($('[data-act="tkpromo"]')); await wait(10); ok(SF.S.pay.promo === 'STUDENT50' && $('#tk-form').textContent.includes(SF.uzs(25000)), 'promo code halves the price');
  submit($('#tk-form')); await wait(10); ok(!!$('#card-form2'), 'step 2: card');
  fill('cd-n', '4111 1111 1111 1112'); fill('cd-e', '08/28'); submit($('#card-form2')); await wait(10); ok(!!$('#card-form2'), 'wrong card number is refused');
  fill('cd-n', SF.DEMO_CARD); fill('cd-e', '01/24'); submit($('#card-form2')); await wait(10); ok(!!$('#card-form2'), 'expired card is refused');
  fill('cd-e', '08/28'); submit($('#card-form2')); await wait(10); ok(!!$('#sms-form'), 'step 3: SMS code');
  fill('sm-c', '000000'); submit($('#sms-form')); await wait(10); ok(!!$('#sms-form'), 'wrong SMS code is refused');
  const n0 = SF.S.tickets.length; fill('sm-c', SF.S.pay.sms); submit($('#sms-form')); await wait(15);
  const tk = SF.S.tickets[0]; ok(SF.S.tickets.length === n0 + 1 && tk.holder === 'Bekzod Tursunov' && tk.price === 25000 && SF.S.invoices[0].plan === 'ticket', 'ticket issued with an invoice');
  ok(location().startsWith('#/tickets') && $$('.ticket').length >= 1, 'My tickets shows the ticket with a QR');
  await go('#/events/e5'); ok($('#view').innerHTML.includes(tk.id), 'event page shows the ticket instead of the buy button');
  // free ticket
  await go('#/events/e2'); const free = !!$('[data-act="buyticket"]'); ok(!free && !!$('[data-act="reg"]') || !!$('[data-act="unreg"]'), 'free events keep one-click registration');
  // refund
  await go('#/tickets'); click($(`[data-act="refund"][data-id="${tk.id}"]`)); await wait(10); ok(tk.status === 'Refunded', 'ticket refunded');
  // Telegram bot
  await go('#/tg'); click($('[data-act="tgcmd"][data-c="/myid"]')); await wait(10); ok(SF.S.botChat['acc-mentor'].slice(-1)[0].t.includes('SF-27-00634'), 'bot answers /myid with the ID');
  fill('tg-msg', '/tickets'); submit($('#tg-form')); await wait(10); ok(SF.S.botChat['acc-mentor'].length === 4, 'typed command gets a reply');
  click($('[data-act="filter"][data-k="tgtab"][data-v="app"]')); await wait(10); ok(!!$('.tg-app'), 'mini-app view opens');
  await setRole('investor'); await go('#/tg'); fill('tg-u', '@dilnoza_k'); submit($('#tglink-form')); await wait(10); ok(SF.S.tgLink['acc-investor'] === '@dilnoza_k', 'investor links Telegram');
  // Sign in with Telegram
  click($('[data-act="logout"]')); await wait(10); await go('#/login'); click($('[data-act="tglogin"]')); await wait(10); ok($$('[data-act="tgconfirm"]').length >= 4, 'Telegram sign-in lists linked accounts');
  click($('[data-act="tgconfirm"][data-id="acc-investor"]')); await wait(15); ok(SF.S.session && SF.S.role === 'investor', 'signed in with Telegram');
  // notifications
  await go('#/notify'); const cb = $('input[data-notify="digest"][data-c="mail"]'); cb.checked = true; cb.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(5); ok(SF.S.notify['acc-investor'].digest.includes('mail'), 'notification channel saved');
  // offline check-in with a ticket code and a member ID
  await setRole('org'); await go('#/events/e5'); const off = $('#offmode'); off.checked = true; off.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(10); ok(SF.S.offline, 'offline mode on');
  fill('ci-id', 'T-5521'); submit($('#checkin-form')); await wait(10); fill('ci-id', 'SF-27-00951'); submit($('#checkin-form')); await wait(10);
  ok(SF.S.offQueue.length === 2 && !(SF.S.checkins.e5 || []).includes('SF-27-00951'), 'check-ins wait in the offline queue');
  off.checked = false; $('#offmode').checked = false; $('#offmode').dispatchEvent(new w.Event('change', { bubbles: true })); await wait(10); click($('[data-act="syncnow"]')); await wait(15);
  ok(SF.S.offQueue.length === 0 && SF.S.checkins.e5.includes('SF-27-00951') && SF.S.tickets.find(x => x.id === 'T-5521').used, 'sync applies queued check-ins and ticket codes');
  fill('ci-id', 'T-5521'); submit($('#checkin-form')); await wait(10); ok(true, 'used ticket is refused again');
  // payments page
  await go('#/payments'); ok($$('#view tbody tr').length >= SF.S.tickets.length && $('#view').innerHTML.includes('Payme'), 'payments page lists tickets and invoices by method');
  await setRole('participant'); await go('#/payments'); ok(location().startsWith('#/noaccess'), 'members cannot open payments');
  function location() { return w.location.hash; }
};
