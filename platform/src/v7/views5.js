// v5 views: the content engine for the org team
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, V = SF.V;
const sh = (title, right = '') => `<div class="sec-h"><h2>${title}</h2>${right}</div>`;
const tab = (k, label, cur) => `<button class="btn sm ${k === cur ? 'dark' : 'ghost'}" data-act="filter" data-k="ctab" data-v="${k}">${t(label)}</button>`;
// all candidate items for the Monday digest: base opportunities + upcoming events + open briefs + extra items the team added
SF.digestPool = () => [...SF.DIGEST, ...SF.EVENTS.slice(0, 4).map(e => ({ t: e.title, s: SF.t(e.place) + ' · ' + e.d + ' ' + SF.t(e.m), tag: e.region === 'Online' ? 'All regions' : e.region })),
  ...SF.BRIEFS.map(b => ({ t: 'Catalyst: ' + b.co, s: SF.t(b.problem), tag: b.guild })), ...SF.S.draft.extra];
SF.wedPool = () => [...SF.BRIEFS.map(b => ({ id: b.id, guild: b.guild, t: b.problem, s: b.co + ' · ' + SF.t(b.budget), go: '#/catalyst/' + b.id })),
  ...Object.entries(SF.S.problems).flatMap(([r, l]) => l.map(p => ({ id: p.id, guild: r, t: p.t, s: SF.t('{r} council', { r: SF.t(r) }), go: '#/council/' + encodeURIComponent(r) })))];
SF.thuPool = () => [...SF.LAUNCHES, ...(SF.S.approved || [])];

// build the Telegram post text in a chosen language (independent of the interface language)
SF.postText = (slot, lang) => {
  const keep = SF.lang; SF.lang = lang; const D = SF.S.draft; let out = '';
  try {
    if (slot === 'mon') { const pool = SF.digestPool(); out = `🗓 ${t('Opportunities digest')} · ${t('This week')}\n\n` + D.mon.map(i => pool[i]).filter(Boolean).map(x => `▪️ ${t(x.t)}\n${t(x.s)} · ${t(x.tag)}`).join('\n\n') + `\n\n👉 ${t('All details in the platform')}: startupfest.uz`; }
    if (slot === 'wed') { const w = SF.wedPool().find(x => x.id === D.wed) || SF.wedPool()[0]; out = `🔥 ${t('Problem of the week')}\n\n${t(w.t)}\n\n${t(w.guild)} · ${w.s}\n\n${t('Have a solution? Apply in the platform before the deadline.')}\n👉 startupfest.uz`; }
    if (slot === 'thu') { const pool = SF.thuPool(); out = `🚀 ${t('Member launches')}\n\n` + D.thu.map(i => pool[i]).filter(Boolean).map(x => `• ${x.n} — ${t(x.t)}`).join('\n') + `\n\n${t('Launched something? Share it on your Startup Fest ID.')}`; }
  } finally { SF.lang = keep; }
  return out;
};

V.content = () => {
  const S = SF.S, D = S.draft, cur = S.filters.ctab || 'week', slot = S.filters.cslot || 'mon';
  const head = `${sh(t('Content'), `<div class="filters">${tab('week', 'This week’s posts', cur)}${tab('calendar', 'Calendar and reach', cur)}${tab('cards', 'Instagram cards', cur)}</div>`)}`;
  if (cur === 'calendar') return head + calendar();
  if (cur === 'cards') return head + cards();
  const pool = slot === 'mon' ? SF.digestPool() : slot === 'thu' ? SF.thuPool() : SF.wedPool();
  const sel = slot === 'mon' ? D.mon : slot === 'thu' ? D.thu : [D.wed];
  const items = pool.map((x, i) => { const on = slot === 'wed' ? x.id === D.wed : sel.includes(i);
    return `<label class="it check"><input type="${slot === 'wed' ? 'radio' : 'checkbox'}" name="pick-${slot}" data-act="pickitem" data-slot="${slot}" data-i="${slot === 'wed' ? esc(x.id) : i}" ${on ? 'checked' : ''}>
      <span class="grow"><span class="t">${slot === 'thu' ? esc(x.n) + ' — ' : ''}${t(x.t)}</span><br><span class="s">${slot === 'thu' ? '' : esc(slot === 'wed' ? t(x.guild) : t(x.tag)) + ' · '}${esc(slot === 'thu' ? '' : t(x.s))}</span></span></label>`; }).join('');
  const text = SF.postText(slot, D.lang), n = text.length;
  const queue = slot === 'thu' && S.launchQueue.length ? `<div class="card pad stack" style="border-color:var(--accent)"><b>${t('Waiting for review ({n})', { n: S.launchQueue.length })}</b>${S.launchQueue.map(q => `<div class="row between"><span><b>${esc(q.n)}</b> — ${esc(q.t)} <span class="muted small">· ${esc(q.by)}</span></span>
    <span class="row"><button class="btn sm" data-act="approve" data-id="${q.id}">${t('Approve')}</button><button class="btn ghost sm" data-act="reject" data-id="${q.id}">${t('Decline')}</button></span></div>`).join('')}</div>` : '';
  return head + `<div class="row" style="margin-bottom:14px">${SF.SLOTS.map(([k, d, l]) => `<button class="btn ${k === slot ? '' : 'ghost'}" data-act="filter" data-k="cslot" data-v="${k}"><b>${t(d)}</b> ${t(l)}</button>`).join('')}</div>
  <div class="detail"><div class="stack">${queue}
    <div class="card pad stack"><b>${t('Pick what goes into the post')}</b><div class="list">${items}</div>
    ${slot === 'mon' ? `<form id="extra-form" class="row"><label class="sr" for="ex-t">${t('Title')}</label><input id="ex-t" class="input grow" placeholder="${t('Add an opportunity: title')}" required>
      <label class="sr" for="ex-s">${t('Details')}</label><input id="ex-s" class="input grow" placeholder="${t('Deadline, place or prize')}"><button class="btn sm">${t('Add')}</button></form>` : ''}</div></div>
  <div class="stack"><div class="card pad stack"><div class="row between"><b>${t('Telegram preview')}</b><div class="langs">${['uz', 'ru', 'en'].map(l => `<button data-act="postlang" data-l="${l}" aria-pressed="${l === D.lang}">${l.toUpperCase()}</button>`).join('')}</div></div>
    <div class="tg"><div class="tg-head"><img src="assets/img/startupfest-logo.svg" alt=""><div><b>Startup Fest</b><div class="small muted">@startupfestuz</div></div></div>
      <div class="tg-bubble" id="tgtext">${esc(text).replace(/\n/g, '<br>')}</div><div class="small muted" style="text-align:right">👁 · ${t('draft')}</div></div>
    <div class="row between"><span class="small ${n > 1024 ? 'muted' : ''}">${t('{n} characters', { n })} · ${n > 1024 ? t('too long for a photo caption (1,024)') : t('fits a photo caption')}</span></div>
    <div class="row"><button class="btn ghost sm" data-act="copypost" data-slot="${slot}">${t('Copy text')}</button><button class="cta" data-act="publish" data-slot="${slot}"><span class="btn">${t('Mark as published')}</span>${SF.ARROW}</button></div>
    <span class="muted small">${t('Publishing updates “This week” on every member’s home page.')}</span></div></div></div>`;
};

function calendar() {
  const S = SF.S, max = Math.max(...S.posts.map(p => p.views), 1), last = S.posts.slice(0, 8).reverse();
  const W = 640, H = 220, bw = W / Math.max(last.length, 1);
  const chart = `<svg viewBox="0 0 ${W} ${H + 40}" width="100%" role="img" aria-label="${t('Views per post')}" style="max-width:100%">
    ${[0.25, 0.5, 0.75, 1].map(f => `<line x1="0" x2="${W}" y1="${H - H * f}" y2="${H - H * f}" stroke="#eee"/>`).join('')}
    ${last.map((p, i) => { const h = Math.max(4, p.views / max * (H - 30)); return `<rect x="${i * bw + 10}" y="${H - h}" width="${bw - 20}" height="${h}" rx="8" fill="${p.slot === 'wed' ? '#e01a09' : p.slot === 'mon' ? '#272727' : '#d12800'}"/>
      <text x="${i * bw + bw / 2}" y="${H - h - 8}" text-anchor="middle" font-size="14" font-weight="700" fill="#272727">${SF.fmt(p.views)}</text>
      <text x="${i * bw + bw / 2}" y="${H + 18}" text-anchor="middle" font-size="12" fill="#6b6b6b">${t({ mon: 'MON', wed: 'WED', thu: 'THU' }[p.slot])} ${esc(p.week)}</text>`; }).join('')}</svg>`;
  const cell = (w, s) => { const pub = S.posts.find(p => p.week === w && p.slot === s), st = pub ? 'published' : S.plan[w + '|' + s] || 'empty';
    return `<td><span class="chip ${st === 'published' ? 'ok' : st === 'draft' ? 'warn' : st === 'planned' ? 'red' : ''}">${t({ published: 'Published', draft: 'Draft', planned: 'Planned', empty: 'Empty' }[st])}</span>
      ${st === 'empty' ? ` <button class="linkbtn" data-act="planslot" data-key="${w}|${s}">${t('Schedule')}</button>` : ''}${pub ? ` <span class="small muted num">👁 ${SF.fmt(pub.views)}</span>` : ''}</td>`; };
  const avg = Math.round(S.posts.reduce((a, p) => a + p.views, 0) / S.posts.length);
  return `<div class="kpis">${[[SF.fmt(S.posts.length), 'posts published', 'red'], [SF.fmt(avg), 'average views per post', ''], [SF.fmt(Math.max(...S.posts.map(p => p.views))), 'best post', ''], [t('Wednesday'), 'strongest day', 'black']]
    .map(([a, b, c]) => `<div class="kpi ${c}"><b class="num">${a}</b><span>${t(b)}</span></div>`).join('')}</div>
  ${sh(t('Next 4 weeks'))}<div class="card tablewrap"><table><thead><tr><th>${t('Week of')}</th>${SF.SLOTS.map(([, d, l]) => `<th>${t(d)} · ${t(l)}</th>`).join('')}</tr></thead>
  <tbody>${SF.WEEKS.map(w => `<tr><td><b>${esc(w)}</b></td>${SF.SLOTS.map(([s]) => cell(w, s)).join('')}</tr>`).join('')}</tbody></table></div>
  ${sh(t('Reach'), `<span class="muted">${t('Views per post on the Telegram channel')}</span>`)}<div class="card pad">${chart}</div>
  <div class="card pad stack" style="margin-top:16px"><b>${t('Log views for a published post')}</b><form id="views-form" class="row"><label class="sr" for="vw-p">${t('Post')}</label>
    <select id="vw-p" class="input">${S.posts.map(p => `<option value="${p.id}">${t({ mon: 'MON', wed: 'WED', thu: 'THU' }[p.slot])} ${esc(p.week)} · ${t(p.title)}</option>`).join('')}</select>
    <label class="sr" for="vw-n">${t('Views')}</label><input id="vw-n" class="input" inputmode="numeric" placeholder="${t('Views')}" required style="max-width:140px"><button class="btn sm">${t('Save')}</button></form></div>`;
}

function cards() {
  const S = SF.S, tp = S.filters.ctpl || 'wed', w = SF.wedPool().find(x => x.id === S.draft.wed) || SF.wedPool()[0], l = SF.thuPool()[S.draft.thu[0]] || SF.LAUNCHES[0], e = SF.EVENTS[1];
  const def = { wed: [t('Problem of the week'), t(w.t), t(w.guild)], thu: [t('Member launch'), l.n, t(l.t)], event: [t('Event'), t(e.title), `${e.d} ${t(e.m)} · ${t(e.place)}`], stat: [t('Catalyst 2026'), '$410K', t('deals via Catalyst')] }[tp];
  const v = S.cardText && S.cardText.tp === tp ? S.cardText : { tp, a: def[0], b: def[1], c: def[2] };
  return `<div class="detail"><div class="card pad stack"><div class="row">${SF.CARD_TEMPLATES.map(([k, n]) => `<button class="btn sm ${k === tp ? 'dark' : 'ghost'}" data-act="filter" data-k="ctpl" data-v="${k}">${t(n)}</button>`).join('')}</div>
    <div class="cardwrap"><canvas id="igcard" width="1080" height="1350" aria-label="${t('Instagram card preview')}"></canvas></div></div>
  <div class="card pad stack"><b>${t('Text on the card')}</b><form id="card-form" class="stack" data-tp="${tp}">
    <div class="field"><label for="cd-a">${t('Small label')}</label><input id="cd-a" value="${esc(v.a)}"></div>
    <div class="field"><label for="cd-b">${t('Headline')}</label><textarea id="cd-b">${esc(v.b)}</textarea></div>
    <div class="field"><label for="cd-c">${t('Bottom line')}</label><input id="cd-c" value="${esc(v.c)}"></div>
    <button class="btn ghost sm" style="align-self:start">${t('Update preview')}</button></form>
    <button class="cta" data-act="dlcard"><span class="btn">${t('Download PNG')}</span>${SF.ARROW}</button><span class="muted small">${t('1080 × 1350, the Instagram portrait size.')}</span></div></div>`;
}

// draw the Instagram card on the canvas in the Startup Fest style
SF.drawCard = async () => {
  const cv = document.getElementById('igcard'); if (!cv || !cv.getContext) return; let ctx = null; try { ctx = cv.getContext('2d'); } catch (e) {} if (!ctx) return; const S = SF.S, tp = S.filters.ctpl || 'wed';
  const a = document.getElementById('cd-a').value, b = document.getElementById('cd-b').value, c = document.getElementById('cd-c').value;
  try { await Promise.all([document.fonts.load('800 120px "Big Shoulders"'), document.fonts.load('300 40px "Urbanist"'), document.fonts.load('700 40px "Urbanist"')]); } catch (e) {}
  const x = ctx, W = 1080, H = 1350, dark = tp === 'thu';
  const g = x.createLinearGradient(0, 0, 200, H); g.addColorStop(0, dark ? '#1a1a1a' : '#d12800'); g.addColorStop(1, dark ? '#050505' : '#970000');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.save(); x.globalAlpha = dark ? .9 : .18; x.translate(470, 820); x.scale(2.6, 2.6); x.fillStyle = dark ? '#e01a09' : '#fff'; x.fill(new Path2D(SF.STAR_PATH)); x.restore();
  await new Promise(res => { const im = new Image(); im.onload = () => { x.fillStyle = '#fff'; x.beginPath(); x.roundRect ? x.roundRect(70, 70, 300, 140, 40) : x.rect(70, 70, 300, 140); x.fill(); x.drawImage(im, 92, 86, 256, 108); res(); }; im.onerror = res; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SF.LOGO_SVG); });
  x.fillStyle = '#fff'; x.font = '700 40px "Urbanist", "Onest", Arial'; x.fillText(a.toUpperCase(), 80, 330);
  const big = tp === 'stat'; x.font = `800 ${big ? 300 : 118}px "Big Shoulders", "Oswald", Impact`;
  const words = b.toUpperCase().split(/\s+/), lines = []; let line = '';
  words.forEach(wd => { const tst = line ? line + ' ' + wd : wd; if (x.measureText(tst).width > W - 160 && line) { lines.push(line); line = wd; } else line = tst; }); if (line) lines.push(line);
  const lh = big ? 280 : 112; lines.slice(0, 6).forEach((l, i) => x.fillText(l, 80, 470 + i * lh + (big ? 160 : 0)));
  x.font = '300 44px "Urbanist", "Onest", Arial'; const cl = c.length > 48 ? c.slice(0, 47) + '…' : c; x.fillText(cl, 80, H - 170);
  x.font = '700 34px "Urbanist", "Onest", Arial'; x.fillText('t.me/startupfestuz', 80, H - 90);
};
})();
