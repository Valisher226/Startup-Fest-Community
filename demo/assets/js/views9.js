// v9 views: Telegram bot and mini-app, tickets, notification settings, payments, offline check-in desk
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, V = SF.V;
const S = () => SF.S, role = () => SF.S.role, R = k => SF.ROLES[k];
const sh = (title, right = '') => `<div class="sec-h"><h2>${title}</h2>${right}</div>`;
SF.ev = id => SF.EVENTS.find(e => e.id === id);
SF.tkType = (ev, k) => (SF.TICKETS[ev] || []).find(x => x[0] === k) || [k, k, 0];
SF.myTickets = () => S().tickets.filter(x => x.holder === SF.myName() || x.holder === SF.me().name);
SF.ticketFor = ev => SF.myTickets().find(x => x.ev === ev && x.status === 'Paid');
SF.paidEvent = ev => (SF.TICKETS[ev] || []).some(x => x[2] > 0);
// a Luhn-valid demo card for the payment form
SF.luhnOk = n => { const d = n.replace(/\D/g, ''); if (d.length !== 16) return false; let s = 0; for (let i = 0; i < 16; i++) { let x = +d[15 - i]; if (i % 2) { x *= 2; if (x > 9) x -= 9; } s += x; } return s % 10 === 0; };
SF.DEMO_CARD = (() => { const p = '860012345678901'; for (let c = 0; c < 10; c++) if (SF.luhnOk(p + c)) return (p + c).replace(/(\d{4})(?=\d)/g, '$1 '); })();

/* ---------- tickets ---------- */
const tkCard = x => { const e = SF.ev(x.ev) || {}, ty = SF.tkType(x.ev, x.type);
  return `<div class="ticket ${x.status === 'Paid' ? '' : 'off'}"><div class="tk-main"><div class="eyebrow" style="color:#fff;opacity:.75">${t(ty[1])}</div><b class="display" style="font-size:30px;line-height:1">${t(e.title || '')}</b>
    <span>${esc(e.d)} ${t(e.m || '')} · ${t(e.place || '')}</span><span class="mono">${x.id}</span></div>
    <div class="tk-side">${x.status === 'Paid' ? `<div class="qr sm" data-qr="${x.id}"></div>` : `<span class="chip">${t(x.status)}</span>`}
    <span class="small">${x.price ? SF.uzs(x.price) : t('Free')}${x.used ? ' · ' + t('Used') : ''}</span>${x.status === 'Paid' && x.price && !x.used ? `<button class="linkbtn small" data-act="refund" data-id="${x.id}">${t('Refund')}</button>` : ''}</div></div>`; };
V.tickets = () => { const mine = SF.myTickets(), paid = SF.EVENTS.filter(e => SF.TICKETS[e.id]);
  return `${SF.back('#/events', t('All events'))}${sh(t('My tickets'), `<span class="muted">${t('Show the QR at the door. It works without internet.')}</span>`)}
  <div class="grid g2">${mine.map(tkCard).join('') || `<div class="card empty">${t('No tickets yet')}</div>`}</div>
  ${sh(t('Tickets on sale'))}<div class="grid g3">${paid.map(e => { const min = Math.min(...SF.TICKETS[e.id].map(x => x[2]));
    return `<a class="card pad stack link" href="#/events/${e.id}" style="gap:6px"><span class="chip ${min ? 'red' : 'ok'}" style="align-self:start">${min ? t('from {p}', { p: SF.uzs(min) }) : t('Free')}</span><b style="font-size:17px">${t(e.title)}</b><span class="muted small">${esc(e.d)} ${t(e.m)} · ${t(e.place)}</span></a>`; }).join('')}</div>`; };

/* ---------- event page: tickets for members, offline desk for the org team ---------- */
const event8 = V.event;
V.event = id => { let h = event8(id); const e = SF.ev(id); if (!e) return h; const org = role() === 'org';
  if (org) { const sold = S().tickets.filter(x => x.ev === id && x.status === 'Paid'), q = S().offQueue.filter(x => x.ev === id);
    const desk = `<div class="card pad stack offdesk ${S().offline ? 'is-off' : ''}"><div class="row between"><b>${S().offline ? t('Offline mode') : t('Online')}</b><label class="switch"><input type="checkbox" id="offmode" ${S().offline ? 'checked' : ''} aria-label="${t('Offline mode')}"><span></span></label></div>
      <span class="muted small">${S().offline ? t('Check-ins are saved on this device and sent when the internet is back.') : t('Turn on when the venue has no internet. Check-ins keep working.')}</span>
      ${q.length ? `<div class="row between"><span class="chip warn">${t('{n} waiting to sync', { n: q.length })}</span><button class="btn sm" data-act="syncnow" ${S().offline ? 'disabled' : ''}>${t('Sync now')}</button></div>` : ''}
      ${sold.length ? `<div class="row between small"><span>${t('Tickets sold')}</span><b class="num">${sold.length} · ${SF.uzs(sold.reduce((a, x) => a + x.price, 0))}</b></div>` : ''}<span class="muted small">${t('Ticket codes like T-5521 also work at the desk.')}</span></div>`;
    return h.replace(`<div class="card pad stack"><b>${t('Check-in desk')}</b>`, desk + `<div class="card pad stack"><b>${t('Check-in desk')}</b>`); }
  const tk = SF.ticketFor(id);
  if (tk) return h.replace(/<div class="card pad stack" style="align-items:center;text-align:center">[\s\S]*?(<\/button>|<\/span>)<\/div>/, `<div class="card pad stack" style="align-items:center;text-align:center"><span class="chip ok">${t('Your ticket')}</span><div class="qr" data-qr="${tk.id}"></div><div class="mono muted">${tk.id}</div><span class="muted small">${t(SF.tkType(id, tk.type)[1])} · ${tk.price ? SF.uzs(tk.price) : t('Free')}</span><a class="btn ghost sm" href="#/tickets">${t('My tickets')}</a></div>`);
  if (SF.paidEvent(id)) { const min = Math.min(...SF.TICKETS[id].map(x => x[2]).filter(Boolean));
    return h.replace(`<button class="btn" data-act="reg" data-ev="${id}">${t('Register with my ID')}</button>`, `<span class="chip red">${t('from {p}', { p: SF.uzs(min) })}</span><button class="btn" data-act="buyticket" data-ev="${id}">${t('Buy a ticket')}</button>`); }
  return h; };
const events8 = V.events;
V.events = p => { const h = events8(p); if (p || role() === 'org') return h; const n = SF.myTickets().filter(x => x.status === 'Paid').length;
  return h.replace('<div class="grid g2">', `<a class="card pad row between link" href="#/tickets" style="margin-bottom:16px"><b>🎟 ${t('My tickets')}</b><span class="chip red">${n}</span></a><div class="grid g2">`); };

/* ---------- Telegram: bot chat and mini-app ---------- */
SF.botReply = cmd => { const me = SF.me(), c = cmd.trim().toLowerCase().split(/\s+/)[0];
  if (c === '/start') return t('Hi {n}! Your Startup Fest account is linked. I will send you events, tickets and replies here.', { n: SF.myName().split(' ')[0] });
  if (c === '/events') return SF.EVENTS.slice(0, 4).map(e => `📅 ${e.d} ${t(e.m)} — ${t(e.title)}`).join('\n');
  if (c === '/myid') return `🪪 ${me.name}\n${me.id}\n${t('{p} points', { p: me.points })} · ${t(SF.level(me.points).cur[0])}`;
  if (c === '/tickets') { const l = SF.myTickets().filter(x => x.status === 'Paid'); return l.length ? l.map(x => `🎟 ${x.id} — ${t((SF.ev(x.ev) || {}).title || '')}`).join('\n') : t('No tickets yet'); }
  if (c === '/digest') return ((S().pub && S().pub.mon) || SF.DIGEST).slice(0, 4).map(x => `• ${t(x.t)}`).join('\n');
  if (c === '/help') return SF.BOT_CMDS.map(([k, d]) => `${k} — ${t(d)}`).join('\n');
  return t('I did not understand. Try /help.'); };
const bubble = (m, mine) => `<div class="tgm ${mine ? 'me' : ''}">${esc(m.t).replace(/\n/g, '<br>')}${m.go ? `<a class="tgbtn" href="${m.go}">${t('Open')}</a>` : ''}<span class="tgtime">${m.time || ''}</span></div>`;
V.tg = () => { const a = SF.account(); if (!a) return V.login(); const link = S().tgLink[a.id], tab = S().filters.tgtab || 'chat';
  const notes = S().notifs.filter(n => n.role === S().role).slice(0, 5).reverse().map(n => ({ t: '🔔 ' + t(n.t), go: n.go, time: '09:00' }));
  const chat = S().botChat[a.id] || [];
  const phone = !link ? `<div class="tg-link stack"><b>${t('Link your Telegram')}</b><span class="small">${t('The bot sends reminders, tickets and replies. It never posts for you.')}</span>
      <form id="tglink-form" class="stack"><div class="field"><label for="tg-u">${t('Telegram username')}</label><input id="tg-u" required placeholder="@username" value="${esc(SF.me().fields.telegram || '')}"></div><button class="btn">${t('Link')}</button></form></div>`
    : tab === 'chat' ? `<div class="tg-chat" id="scroll">${bubble({ t: t('Welcome to Startup Fest! Type /help to see what I can do.'), time: '08:58' })}${notes.map(m => bubble(m)).join('')}${chat.map(m => bubble(m, m.me)).join('')}</div>
      <form id="tg-form" class="tg-input"><label for="tg-msg" class="sr">${t('Message')}</label><input id="tg-msg" placeholder="${t('Type a command, e.g. /myid')}" autocomplete="off"><button aria-label="${t('Send')}">➤</button></form>
      <div class="tg-cmds">${SF.BOT_CMDS.slice(1, 5).map(([k]) => `<button data-act="tgcmd" data-c="${k}">${k}</button>`).join('')}</div>`
    : `<div class="tg-app"><div class="tg-app-head">${SF.STAR(18, '#fff')}<b>Startup Fest</b><span class="small" style="opacity:.8">${t('mini-app')}</span></div>
      <div class="tg-app-body"><div class="tg-idc" style="--idc:${R(S().role).color}"><div><div class="eyebrow" style="color:#fff">${t(R(S().role).label)}</div><b>${esc(SF.me().name)}</b><div class="mono" style="opacity:.85">${SF.me().id}</div></div><div class="qr xs" data-qr="${SF.me().id}"></div></div>
      ${(() => { const tk = SF.myTickets().find(x => x.status === 'Paid'); return tk ? `<a class="tg-row" href="#/tickets">🎟 <span class="grow">${t((SF.ev(tk.ev) || {}).title || '')}</span><b>${tk.id}</b></a>` : ''; })()}
      ${[['#/events', '📅', 'Events'], ['#/hours', '🧑‍🏫', 'Office hours'], ['#/me', '⭐', 'My ID'], ['#/notify', '🔔', 'Notifications']].map(([h, i, l]) => `<a class="tg-row" href="${h}">${i} <span class="grow">${t(l)}</span>›</a>`).join('')}
      <div class="eyebrow" style="margin:6px 0 2px">${t('This week')}</div>${((S().pub && S().pub.mon) || SF.DIGEST).slice(0, 3).map(x => `<div class="tg-row small">• <span class="grow">${esc(t(x.t))}</span></div>`).join('')}</div></div>`;
  return `${sh(t('Telegram'), link ? `<span class="chip ok">✓ ${esc(link)}</span>` : '')}
  <div class="tg-wrap"><div class="phone"><div class="phone-top"><span class="tg-ava">SF</span><div><b>Startup Fest Bot</b><div class="small" style="opacity:.7">@StartupFestUzBot · ${t('bot')}</div></div></div>
    ${link ? `<div class="tg-tabs"><button data-act="filter" data-k="tgtab" data-v="chat" aria-pressed="${tab === 'chat'}">${t('Chat')}</button><button data-act="filter" data-k="tgtab" data-v="app" aria-pressed="${tab === 'app'}">${t('Mini-app')}</button></div>` : ''}${phone}</div>
  <div class="stack"><div class="card pad stack"><b>${t('Why Telegram')}</b><span class="muted">${t('Most members already read the Startup Fest channel. The bot puts their ID, tickets and reminders in the same app, so they do not need to open a website at the event.')}</span></div>
    <div class="card pad stack"><b>${t('Bot commands')}</b><div class="list">${SF.BOT_CMDS.map(([k, d]) => `<div class="it"><span class="mono">${k}</span><div class="grow">${t(d)}</div></div>`).join('')}</div></div>
    ${link ? `<div class="row"><a class="btn ghost" href="#/notify">${t('Notification settings')}</a><button class="btn ghost" data-act="tgunlink">${t('Unlink Telegram')}</button></div>` : ''}</div></div>`; };

/* ---------- notification settings ---------- */
V.notify = () => { const a = SF.account(); if (!a) return V.login(); const n = S().notify[a.id] = S().notify[a.id] || JSON.parse(JSON.stringify(SF.NOTIFY_DEFAULT));
  return `${SF.back('#/account', t('Account settings'))}${sh(t('Notification settings'), `<span class="muted">${t('Choose where each kind of message reaches you')}</span>`)}
  <div class="card tablewrap"><table class="perm-grid"><thead><tr><th>${t('Messages about')}</th>${SF.CHANNELS.map(([k, l]) => `<th>${t(l)}</th>`).join('')}</tr></thead><tbody>
  ${SF.TOPICS.map(([k, l]) => `<tr><th scope="row">${t(l)}</th>${SF.CHANNELS.map(([c, cl]) => `<td><label class="perm-cell"><input type="checkbox" data-notify="${k}" data-c="${c}" ${(n[k] || []).includes(c) ? 'checked' : ''} ${c === 'tg' && !S().tgLink[a.id] ? 'disabled' : ''} aria-label="${esc(t(l) + ' · ' + t(cl))}"><span></span></label></td>`).join('')}</tr>`).join('')}</tbody></table></div>
  ${S().tgLink[a.id] ? '' : `<p class="muted small">${t('Link Telegram to get messages there.')} <a class="link" href="#/tg">${t('Link Telegram')}</a></p>`}
  <p class="muted small">${t('Payment and security messages always come by SMS as well, whatever you choose here.')}</p>`; };

/* ---------- payments (Org team) ---------- */
V.payments = () => { const tk = S().tickets, inv = S().invoices, paidTk = tk.filter(x => x.status === 'Paid'), paidInv = inv.filter(x => x.status === 'Paid');
  const rows = [...tk.map(x => ({ id: x.id, what: t('Ticket') + ' · ' + t((SF.ev(x.ev) || {}).title || ''), who: x.holder, amt: x.price, method: x.method, status: x.status, date: x.date })),
    ...inv.map(x => ({ id: x.id, what: t((SF.ALL_PLANS.find(p => p.id === x.plan) || { name: x.plan }).name), who: x.to, amt: x.amount, method: x.method, status: x.status, date: x.date }))];
  const byM = SF.PAY.map(([k, n, fee]) => { const l = rows.filter(r => r.status === 'Paid' && (r.method || '').toLowerCase().startsWith(k)); return [n, l.reduce((a, r) => a + r.amt, 0), fee]; });
  const total = rows.filter(r => r.status === 'Paid').reduce((a, r) => a + r.amt, 0), fees = byM.reduce((a, [, v, f]) => a + v * f, 0), mx = Math.max(1, ...byM.map(x => x[1]));
  return `${sh(t('Payments'), `<span class="muted">${t('Tickets and invoices in one place')}</span>`)}
  <div class="kpis"><div class="kpi red"><b class="num">${SF.uzs(total)}</b><span>${t('received')}</span></div><div class="kpi black"><b class="num">${SF.uzs(paidTk.reduce((a, x) => a + x.price, 0))}</b><span>${t('from tickets')}</span></div>
    <div class="kpi"><b class="num">${SF.uzs(Math.round(fees))}</b><span>${t('payment fees (1–1.5%)')}</span></div><div class="kpi"><b class="num">${tk.filter(x => x.status === 'Refunded').length}</b><span>${t('refunds')}</span></div></div>
  <div class="grid g2" style="margin-top:16px;align-items:start"><div class="card pad stack"><b>${t('By payment method')}</b>${byM.map(([n, v]) => `<div><div class="row between small"><span>${t(n)}</span><b class="num">${SF.uzs(v)}</b></div><div class="bar" style="margin-top:4px"><i style="width:${v / mx * 100}%"></i></div></div>`).join('')}
    <span class="muted small">${t('Click and Payme pay out the next working day; card payments within 2 days.')}</span></div>
  <div class="card pad stack"><b>${t('Paid invoices')}</b><b class="display num" style="font-size:40px;color:var(--brand)">${SF.uzs(paidInv.reduce((a, x) => a + x.amount, 0))}</b><span class="muted small">${t('{n} invoices due', { n: inv.filter(x => x.status === 'Due').length })}</span><a class="link small" href="#/admin">${t('Revenue overview')} →</a></div></div>
  ${sh(t('All payments'))}<div class="card tablewrap"><table><thead><tr><th>ID</th><th>${t('What')}</th><th>${t('Who')}</th><th>${t('Amount')}</th><th>${t('Payment method')}</th><th>${t('Status')}</th><th>${t('Date')}</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td class="mono">${r.id}</td><td>${esc(r.what)}</td><td>${esc(r.who)}</td><td class="num">${r.amt ? SF.uzs(r.amt) : t('Free')}</td><td>${t(r.method || '–')}</td><td><span class="chip ${r.status === 'Paid' ? 'ok' : r.status === 'Due' ? 'warn' : ''}">${t(r.status)}</span></td><td>${esc(r.date)}</td></tr>`).join('')}</tbody></table></div>`; };

/* ---------- login page: Sign in with Telegram ---------- */
const login8 = V.login;
V.login = p => login8(p).replace('<div class="demo-hint">', `<button class="tg-login" data-act="tglogin"><span class="tg-ic">✈</span>${t('Sign in with Telegram')}</button><div class="demo-hint">`);

/* ---------- dashboard tile ---------- */
const adm8 = V.admin;
V.admin = () => adm8().replace('<div class="grid g3">', `<div class="grid g3"><a class="card pad tile" href="#/payments"><b style="font-size:20px">${t('Payments')}</b><span class="muted">${t('{n} tickets sold', { n: S().tickets.filter(x => x.status === 'Paid').length })}</span></a>`);
})();
