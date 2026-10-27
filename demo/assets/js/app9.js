// v9 actions: tickets with card + SMS payment, refunds, Telegram bot and login, offline check-in, notification settings
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, A = SF.A, S = () => SF.S;
Object.assign(SF.LABEL, { tickets: 'My tickets', tg: 'Telegram', notify: 'Notification settings', payments: 'Payments' });
Object.assign(SF.TAB_OF, { tickets: 'events', tg: 'me', notify: 'me', payments: 'admin' });
SF.ALL_PLANS.push({ id: 'ticket', name: 'Event ticket', price: 0, per: 'event', perks: [] });
const ORG = ['payments'];
const render8 = SF.render;
SF.render = () => { const v = (location.hash || '').split('/')[1]; if (S().session && ORG.includes(v) && S().role !== 'org') history.replaceState(null, '', '#/noaccess/' + v); render8(); };
let tkN = 5600;
const now = () => new Date().toTimeString().slice(0, 5);

/* ---------- ticket checkout: choose → card → SMS code ---------- */
const priceOf = p => { const base = SF.tkType(p.ev, p.type)[2] * p.qty, promo = SF.PROMOS[p.promo]; return Math.round(base * (1 - (promo ? promo[1] : 0))); };
const step1 = () => { const p = S().pay, e = SF.ev(p.ev), total = priceOf(p);
  SF.modal(`<h3>${t('Buy a ticket')}</h3><p class="muted" style="margin:0">${t(e.title)} · ${esc(e.d)} ${t(e.m)}</p>
  <form id="tk-form" class="stack"><fieldset class="stack" style="border:0;padding:0;margin:0"><legend class="small" style="font-weight:500;margin-bottom:6px">${t('Ticket')}</legend>
    ${SF.TICKETS[p.ev].map(([k, n, pr]) => `<label class="card pad row between" style="padding:12px;cursor:pointer"><span class="row" style="gap:8px"><input type="radio" name="tk-type" value="${k}" ${p.type === k ? 'checked' : ''} style="accent-color:var(--accent)"><b>${t(n)}</b></span><span class="num">${pr ? SF.uzs(pr) : t('Free')}</span></label>`).join('')}</fieldset>
  <div class="two"><div class="field"><label for="tk-q">${t('How many')}</label><select id="tk-q">${[1, 2, 3, 4, 5].map(n => `<option ${p.qty === n ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <div class="field"><label for="tk-promo">${t('Promo code')}</label><div class="row" style="flex-wrap:nowrap"><input id="tk-promo" class="grow" value="${esc(p.promo || '')}" placeholder="STUDENT50" autocomplete="off"><button type="button" class="btn ghost sm" data-act="tkpromo">${t('Apply')}</button></div>${p.promo && SF.PROMOS[p.promo] ? `<span class="hint" style="color:var(--ok)">✓ ${t(SF.PROMOS[p.promo][0])}</span>` : p.promo ? `<span class="ferr">${t('This code does not work')}</span>` : ''}</div></div>
  ${total ? `<fieldset class="stack" style="border:0;padding:0;margin:0"><legend class="small" style="font-weight:500;margin-bottom:6px">${t('Payment method')}</legend><div class="pay-grid">${SF.PAY.map(([k, n]) => `<label class="pay-opt"><input type="radio" name="tk-m" value="${k}" ${p.method === k ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></fieldset>` : ''}
  <div class="row between"><b>${t('Total')}</b><b class="display num" style="font-size:32px;color:var(--brand)">${total ? SF.uzs(total) : t('Free')}</b></div>
  <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="cta" type="submit"><span class="btn">${total ? t('Continue') : t('Get the ticket')}</span>${SF.ARROW}</button></div></form>`); };
const step2 = () => { const p = S().pay, m = SF.PAY.find(x => x[0] === p.method);
  SF.modal(`<h3>${t('Pay with {m}', { m: m[1] })}</h3><div class="steps"><span>1 ${t('Ticket')}</span><span class="on">2 ${t('Card')}</span><span>3 ${t('SMS code')}</span></div>
  <form id="card-form2" class="stack"><div class="field"><label for="cd-n">${t('Card number')}</label><input id="cd-n" inputmode="numeric" autocomplete="cc-number" placeholder="8600 0000 0000 0000" required class="mono" style="font-size:17px"><span class="hint">${t('Demo card: {c}', { c: SF.DEMO_CARD })}</span></div>
  <div class="two"><div class="field"><label for="cd-e">${t('Expiry (MM/YY)')}</label><input id="cd-e" inputmode="numeric" autocomplete="cc-exp" placeholder="08/28" required></div><div class="field"><label for="cd-p">${t('Phone linked to the card')}</label><input id="cd-p" inputmode="tel" value="+998 90 123 45 67"></div></div>
  <div class="row between"><b>${t('Total')}</b><b class="num">${SF.uzs(priceOf(p))}</b></div>
  <div class="row end"><button type="button" class="btn ghost" data-act="tkback">${t('Back')}</button><button class="btn">${t('Send SMS code')}</button></div></form>`); };
const step3 = () => { const p = S().pay;
  SF.modal(`<h3>${t('Enter the SMS code')}</h3><div class="steps"><span>1 ${t('Ticket')}</span><span>2 ${t('Card')}</span><span class="on">3 ${t('SMS code')}</span></div>
  <p class="muted" style="margin:0">${t('We sent a code to {p}.', { p: esc(p.phone.replace(/\d(?=[\d\s]{4})/g, '•')) })}</p><div class="demo-hint"><b>${t('Demo')}</b><span>${t('Your code is {c}', { c: `<b class="mono" style="background:none;color:inherit;letter-spacing:.2em">${p.sms}</b>` })}</span></div>
  <form id="sms-form" class="stack"><div class="field"><label for="sm-c">${t('Code')}</label><input id="sm-c" class="otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code" required></div>
  <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Pay {v}', { v: SF.uzs(priceOf(p)) })}</button></div></form>`); };
const issue = () => { const p = S().pay, total = priceOf(p), each = Math.round(total / p.qty), m = SF.PAY.find(x => x[0] === p.method), ids = [];
  for (let i = 0; i < p.qty; i++) { const id = 'T-' + (tkN++); ids.push(id); S().tickets.unshift({ id, ev: p.ev, type: p.type, holder: SF.myName(), role: S().role, price: each, promo: p.promo || '', method: total ? m[1] : '–', status: 'Paid', date: '26 Oct 2026' }); }
  if (total) S().invoices.unshift({ id: 'INV-2026-T' + ids[0].slice(2), to: SF.myName(), plan: 'ticket', amount: total, status: 'Paid', method: m[1], date: '26 Oct 2026' });
  const reg = S().reg[S().role] = S().reg[S().role] || []; if (!reg.includes(p.ev)) { reg.push(p.ev); SF.award(S().role, 'register', t('Bought a ticket for {e}', { e: t(SF.ev(p.ev).title) })); }
  SF.notify(S().role, t('Your ticket {id} for {e} is ready', { id: ids[0], e: t(SF.ev(p.ev).title) }), '#/tickets');
  if (total) SF.log && SF.log('Money', 'Paid for a ticket', ids[0]);
  S().pay = null; SF.closeModal(); SF.toast(total ? t('Paid. Your ticket is in “My tickets” and in Telegram.') : t('Your ticket is ready')); SF.go('#/tickets'); };

/* ---------- offline check-in ---------- */
const queue = (ev, id) => { S().offQueue.push({ ev, id, at: now() }); SF.toast(t('Saved offline. {n} waiting to sync.', { n: S().offQueue.length })); SF.render(); };
const ticketCheck = (ev, code) => { const tk = S().tickets.find(x => x.id === code);
  if (!tk || tk.ev !== ev || tk.status !== 'Paid') return SF.toast(t('No valid ticket {id} for this event', { id: code }));
  if (tk.used) return SF.toast(t('Ticket {id} was already used', { id: code }));
  tk.used = true; const r = Object.keys(S().people).find(k => S().people[k].name === tk.holder || SF.myNameOf(k) === tk.holder);
  if (r) A.checkin({ ev, id: S().people[r].id }); else { SF.toast(t('Ticket {id} checked in', { id: code })); SF.render(); } };
document.addEventListener('submit', e => { const f = e.target; if (f.id !== 'checkin-form') return; const v = (f.querySelector('#ci-id').value || '').trim().toUpperCase();
  if (/^T-\d{3,6}$/.test(v)) { e.preventDefault(); e.stopPropagation(); return S().offline ? queue(f.dataset.ev, v) : ticketCheck(f.dataset.ev, v); }
  if (S().offline && /^SF-\d{2}-\d{5}$/.test(v)) { e.preventDefault(); e.stopPropagation(); queue(f.dataset.ev, v); } }, true);
window.addEventListener('offline', () => { if (S().role === 'org') { S().offline = true; SF.toast(t('No internet. Check-ins are saved on this device.')); SF.render(); } });
window.addEventListener('online', () => { if (S().offline && S().role === 'org') { S().offline = false; SF.toast(t('Back online. Press “Sync now”.')); SF.render(); } });

const checkin6 = A.checkin, tglogin = () => { const linked = S().accounts.filter(a => S().tgLink[a.id] && a.status !== 'suspended');
  SF.modal(`<h3>${t('Sign in with Telegram')}</h3><p class="muted" style="margin:0">${t('Telegram asks you to confirm. Which Telegram account is on this phone?')}</p>
  <div class="list">${linked.map(a => `<button class="it tg-acc" data-act="tgconfirm" data-id="${a.id}"><span class="mini" style="background:${SF.ROLES[a.role].color}">${SF.initials(a.contact)}</span><div class="grow" style="text-align:left"><div class="t">${esc(S().tgLink[a.id])}</div><div class="s">${esc(a.contact)} · ${t(SF.ROLES[a.role].label)}</div></div><span class="chip">${t('Confirm')}</span></button>`).join('')}</div>
  <p class="muted small" style="margin:0">${t('Only accounts that linked Telegram can sign in this way. Link it in the menu with your name → Telegram.')}</p><div class="row end"><button class="btn ghost" data-close="1">${t('Cancel')}</button></div>`); };
Object.assign(A, {
  buyticket: d => { const opts = SF.TICKETS[d.ev]; S().pay = { ev: d.ev, type: (opts.find(x => x[2] > 0) || opts[0])[0], qty: 1, promo: '', method: 'click' }; step1(); },
  tkpromo: () => { const p = S().pay, f = document.getElementById('tk-form'); p.promo = document.getElementById('tk-promo').value.trim().toUpperCase(); p.qty = +f.querySelector('#tk-q').value; const ty = f.querySelector('input[name=tk-type]:checked'); if (ty) p.type = ty.value; const m = f.querySelector('input[name=tk-m]:checked'); if (m) p.method = m.value; step1(); },
  tkback: () => step1(),
  refund: d => { const x = S().tickets.find(y => y.id === d.id); x.status = 'Refunded'; SF.notify(S().role, t('Refund of {p} for {id} is on its way (1–3 days)', { p: SF.uzs(x.price), id: x.id }), '#/tickets'); SF.log && SF.log('Money', 'Refunded a ticket', x.id); SF.toast(t('Refund requested')); SF.render(); },
  checkin: d => { if (S().offline) return queue(d.ev, d.id); checkin6(d); },
  syncnow: () => { const q = S().offQueue.splice(0); let n = 0; q.forEach(x => { if (/^T-/.test(x.id)) ticketCheck(x.ev, x.id); else { const l = S().checkins[x.ev] = S().checkins[x.ev] || []; if (!l.includes(x.id)) { checkin6({ ev: x.ev, id: x.id }); n++; } } });
    SF.log && SF.log('Programmes', 'Synced offline check-ins', String(q.length)); SF.toast(t('{n} check-ins synced', { n: q.length })); SF.render(); },
  tgcmd: d => { send(d.c); },
  tgunlink: () => { delete S().tgLink[SF.account().id]; SF.toast(t('Telegram unlinked')); SF.render(); },
  tglogin,
  tgconfirm: d => { const acc = S().accounts.find(a => a.id === d.id); SF.closeModal(); SF.login(acc); SF.ui = {}; SF.log && SF.log('Security', 'Signed in with Telegram', acc.email); SF.toast(t('Signed in as {n}', { n: acc.contact })); SF.go('#/' + SF.NAV[acc.role][0]); },
});
const send = txt => { const a = SF.account(), c = S().botChat[a.id] = S().botChat[a.id] || []; c.push({ me: 1, t: txt, time: now() }); c.push({ me: 0, t: SF.botReply(txt), time: now() }); if (c.length > 40) c.splice(0, c.length - 40); SF.render(); };
document.addEventListener('change', e => { const el = e.target;
  if (el.id === 'offmode') { S().offline = el.checked; SF.log && SF.log('Programmes', el.checked ? 'Turned on offline check-in' : 'Turned off offline check-in', ''); SF.render(); }
  if (el.dataset && el.dataset.notify) { const n = S().notify[SF.account().id], l = n[el.dataset.notify] = n[el.dataset.notify] || []; n[el.dataset.notify] = el.checked ? [...new Set([...l, el.dataset.c])] : l.filter(x => x !== el.dataset.c); SF.toast(t('Saved')); }
});

const chrome8 = SF.renderChrome;
SF.renderChrome = () => { chrome8(); const up = document.getElementById('umpanel'); if (!up || up.querySelector('[href="#/tg"]')) return;
  up.querySelector('[href="#/account"]').insertAdjacentHTML('afterend', `<a href="#/tg">${t('Telegram')}</a><a href="#/notify">${t('Notification settings')}</a>${S().role === 'org' ? `<a href="#/payments">${t('Payments')}</a>` : `<a href="#/tickets">${t('My tickets')}</a>`}`); };

const fh8 = SF.formHandlers;
SF.formHandlers = (f, val) => { const p = S().pay;
  if (f.id === 'tk-form') { const ty = f.querySelector('input[name=tk-type]:checked'); if (ty) p.type = ty.value; p.qty = +val('tk-q') || 1; const m = f.querySelector('input[name=tk-m]:checked'); if (m) p.method = m.value;
    const pr = val('tk-promo').toUpperCase(); if (pr !== (p.promo || '')) { p.promo = pr; return step1(); }
    return priceOf(p) ? step2() : issue(); }
  if (f.id === 'card-form2') { if (!SF.luhnOk(val('cd-n'))) return SF.toast(t('Check the card number'));
    const m = val('cd-e').match(/^(\d{2})\s*\/\s*(\d{2})$/); if (!m || +m[1] < 1 || +m[1] > 12 || (2000 + +m[2]) * 12 + +m[1] < 2026 * 12 + 10) return SF.toast(t('Check the expiry date'));
    p.card = val('cd-n').replace(/\D/g, '').slice(-4); p.phone = val('cd-p'); p.sms = String(100000 + Math.floor(Math.random() * 900000)); return step3(); }
  if (f.id === 'sms-form') { if (val('sm-c') !== p.sms) return SF.toast(t('Wrong code')); return issue(); }
  if (f.id === 'tg-form') { const v = val('tg-msg'); if (v) send(v); setTimeout(() => { const i = document.getElementById('tg-msg'); i && i.focus(); }, 0); return; }
  if (f.id === 'tglink-form') { let u = val('tg-u'); if (!/^@?[A-Za-z0-9_]{5,32}$/.test(u)) return SF.toast(t('Telegram usernames have 5–32 letters, numbers or _')); if (u[0] !== '@') u = '@' + u;
    S().tgLink[SF.account().id] = u; send('/start'); SF.toast(t('Telegram linked')); return; }
  return fh8(f, val);
};
})();
