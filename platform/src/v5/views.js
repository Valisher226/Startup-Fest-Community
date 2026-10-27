// Page views. Each returns HTML for #view. Routes: #/view/param
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, V = SF.V = {};
const role = () => SF.S.role;
const brief = id => SF.BRIEFS.find(b => b.id === id);
const sh = (title, right = '') => `<div class="sec-h"><h2>${title}</h2>${right}</div>`;
const sparkRed = SF.SPARK.replace('class="spark"', 'class="spark" style="color:var(--red)"');

/* ---------- Home ---------- */
V.home = () => {
  const me = SF.me(), r = role(), m = SF.metrics();
  const lead = { participant: 'Your next step: a Catalyst brief, a gig, or the National Final.', mentor: 'Founders near you need your hours this week.',
    investor: 'Curated deal flow from 14 regions.', company: 'Real problems in, signed pilots out.', org: 'Everything the community did this week.' }[r];
  const cta = { participant: ['#/events', "See this month's events"], mentor: ['#/directory', 'Find founders to help'], investor: ['#/directory', 'See deal flow'],
    company: ['#/catalyst', 'Open my briefs'], org: ['#/admin', 'Open the dashboard'] }[r];
  const rec = {
    participant: [['#/catalyst/b1', 'Apply to the AgriTech Catalyst brief'], ['#/events/e2', 'Register for Startup Night · Samarkand'], ['#/earn', '2 gigs match your skills']],
    mentor: [['#/messages', '1 founder asked for feedback'], ['#/events/e2', 'Judge at Startup Night · Samarkand'], ['#/directory', 'Offer office hours to a startup']],
    investor: [['#/directory', '4 startups match AgriTech + FinTech'], ['#/events/e5', 'VC Battle · 12 Dec'], ['#/directory', 'Request a curated shortlist']],
    company: [['#/catalyst/b1', 'Review applications to your brief'], ['#/pilot/p1', 'Suvchi pilot: day 64 of 100'], ['#/earn', 'Post a gig for student builders']],
    org: [['#/events/e2', 'Check people in at Startup Night'], ['#/catalyst', '2 pilots running'], ['#/community', 'Councils: 3 pilot regions']],
  }[r];
  const L = SF.S.launches;
  return `
  <section class="hero curtain">
    <div class="txt">
      <div class="row" style="gap:8px">${SF.SPARK}<span class="eyebrow" style="color:#fff;opacity:.9">${t('Salom, {n}', { n: esc(me.name.split(' ')[0]) })}</span></div>
      <h1>${t('From every region,')}<br>${t('into every industry')}</h1>
      <p style="margin:0;max-width:46ch;opacity:.92">${t(lead)}</p>
      <div class="row"><a class="btn light" href="${cta[0]}">${t(cta[1])}</a>
        <a class="btn ghost on-red" href="#/me">${t('My Startup Fest ID')}</a></div>
    </div>
    <div class="photo" style="background-image:url(assets/img/hero.jpg)" role="img" aria-label="${t('Startup Fest stage at a Catalyst event')}"></div>
    <div class="kpis">
      <div class="kpi"><b class="num">${SF.fmt(m.members)}</b><span>${t('members with an ID')}</span></div>
      <div class="kpi"><b class="num">14</b><span>${t('regions')}</span></div>
      <div class="kpi"><b class="num">${SF.BRIEFS.length}</b><span>${t('open Catalyst briefs')}</span></div>
      <div class="kpi"><b class="num">$410K</b><span>${t('deals via Catalyst')}</span></div>
    </div>
  </section>
  ${sh(t('This week'), `<span class="muted">${t('Fresh every Monday, Wednesday and Thursday')}</span>`)}
  <div class="grid g3">
    <div class="card pad day"><div class="d">${t('MON')}</div><div class="stack" style="gap:6px"><b>${t('Opportunities digest')}</b>
      <div class="list">${((SF.S.pub && SF.S.pub.mon) || SF.DIGEST).map(x => `<div class="it"><div class="grow"><div class="t">${t(x.t)}</div><div class="s">${t(x.s)}</div></div><span class="chip ${x.tag === 'Fast lane' ? 'red' : ''}">${t(x.tag)}</span></div>`).join('')}</div></div></div>
    <div class="card pad day"><div class="d">${t('WED')}</div><div class="stack"><b>${t('Problem of the week')}</b>
      ${(() => { const W = (SF.S.pub && SF.S.pub.wed) || { guild: SF.BRIEFS[2].guild, t: SF.BRIEFS[2].problem, s: SF.BRIEFS[2].co + ' · ' + t('owner') + ': ' + t(SF.BRIEFS[2].owner) + ' · ' + t(SF.BRIEFS[2].budget), go: '#/catalyst/b3' };
        return `<span class="chip red" style="align-self:start">${t(W.guild)}</span><div style="font-size:17px;font-weight:600">${t(W.t)}</div><div class="muted small">${esc(W.s)}</div><a class="btn sm" style="align-self:start" href="${W.go}">${t('View brief')}</a>`; })()}</div></div>
    <div class="card pad day"><div class="d">${t('THU')}</div><div class="stack" style="gap:6px"><b>${t('Member launches')}</b>
      <div class="list">${((SF.S.pub && SF.S.pub.thu) || SF.LAUNCHES).map((x, i) => `<div class="it"><div class="grow"><div class="t">${esc(x.n)}</div><div class="s">${t(x.t)}</div></div>
        <button class="btn ghost sm" data-act="upvote" data-i="${i}" ${SF.S.upvoted.includes(i) ? 'disabled' : ''} aria-label="${t('Upvote')} ${esc(x.n)}">▲ <span class="num">${L[i] ?? x.v ?? 0}</span></button></div>`).join('')}</div>
      ${SF.S.role === 'participant' ? `<button class="btn ghost sm" style="align-self:start" data-act="sharelaunch">${t('Share a launch')}</button>` : ''}</div></div>
  </div>
  ${sh(t('For you'))}
  <div class="grid g3">${rec.map(([h, x]) => `<a class="card pad row hover link" href="${h}">${sparkRed}<span style="font-weight:600">${t(x)}</span></a>`).join('')}</div>
  ${sh(t('The fast lane'), `<span class="muted">${t('What a verified ID unlocks')}</span>`)}
  <div class="grid g3">${[['Priority review', 'At UzCombinator and Yoshlar Ventures pitch days'], ['International delegations', 'Web Summit, Slush, TechCrunch Disrupt'], ['Direct path', 'From your regional stage to the National Final in June']]
    .map(([a, b]) => `<div class="card pad pin"><div class="eyebrow" style="color:var(--red)">${t('Fast lane')}</div><div style="font-weight:700;font-size:17px;margin-top:4px">${t(a)}</div><div class="muted">${t(b)}</div></div>`).join('')}</div>`;
};

/* ---------- Events ---------- */
V.events = id => {
  if (id) return V.event(id);
  const f = SF.S.filters.ev || 'All', types = ['All', ...new Set(SF.EVENTS.map(e => e.type))];
  const list = SF.EVENTS.filter(e => f === 'All' || e.type === f), reg = SF.S.reg[role()] || [];
  return `${sh(t('Events'), `<div class="filters"><label class="muted" for="f-ev" style="align-self:center">${t('Type')}</label><select id="f-ev" data-filter="ev">${types.map(x => `<option value="${x}" ${x === f ? 'selected' : ''}>${t(x)}</option>`).join('')}</select></div>`)}
  <div class="grid g2">${list.map(e => { const on = reg.includes(e.id), n = e.taken + (on ? 1 : 0);
    return `<a class="card pad ev hover link" href="#/events/${e.id}"><div class="date"><b>${e.d}</b><span>${t(e.m)}</span></div><div class="stack" style="gap:8px">
      <div class="row between"><span class="chip ${e.type === 'Catalyst' ? 'red' : ''}">${t(e.type)}</span><span class="muted num small">${n}/${e.seats} ${t('seats')}</span></div>
      <div style="font-weight:700;font-size:17px">${t(e.title)}</div><div class="muted">${t(e.place)}</div>
      <div class="bar"><i style="width:${Math.round(n / e.seats * 100)}%"></i></div>
      ${on ? `<span class="chip ok" style="align-self:start">${t('Registered')}</span>` : ''}</div></a>`; }).join('')}</div>`;
};
V.event = id => {
  const e = SF.EVENTS.find(x => x.id === id); if (!e) return V.events();
  const r = role(), me = SF.me(), reg = (SF.S.reg[r] || []).includes(id), ins = SF.S.checkins[id] || [], meIn = ins.includes(me.id);
  const org = r === 'org';
  const right = org ? `<div class="card pad stack"><b>${t('Check-in desk')}</b>
      <form class="row" id="checkin-form" data-ev="${id}"><label for="ci-id" class="sr">${t('Member ID')}</label><input id="ci-id" class="input grow" placeholder="SF-27-00317" autocomplete="off" style="font-family:var(--f-mono)"><button class="btn">${t('Check in')}</button></form>
      <span class="muted small">${t('Type or scan the ID from the member’s QR. Try SF-27-00317 (Aziza).')}</span>
      <div class="list">${SF.ATTENDEES.map(a => { const done = ins.includes(a.id); return `<div class="it"><span class="mini" style="background:${SF.ROLES[a.role].color}">${SF.initials(a.name)}</span>
        <div class="grow"><div class="t">${esc(a.name)}</div><div class="s mono">${a.id}</div></div>${done ? `<span class="chip ok">${t('Checked in')}</span>` : `<button class="btn ghost sm" data-act="checkin" data-ev="${id}" data-id="${a.id}">${t('Check in')}</button>`}</div>`; }).join('')}</div>
      <div class="row between"><span class="muted">${t('Checked in')}</span><b class="num">${ins.length}</b></div></div>`
    : `<div class="card pad stack" style="align-items:center;text-align:center">
      ${reg ? `<span class="chip ok">${meIn ? t('Checked in · points added') : t('Registered')}</span><div class="qr" id="qr" data-qr="${me.id}"></div><div class="mono muted">${me.id}</div>
        <span class="muted small">${t('Show this QR at the door.')}</span>${meIn ? '' : `<button class="btn ghost sm" data-act="unreg" data-ev="${id}">${t('Cancel registration')}</button>`}`
      : `<b>${t('Join this event')}</b><span class="muted small">${t('You get a QR for the door and +{p} points.', { p: SF.RULES.register })}</span><button class="btn" data-act="reg" data-ev="${id}">${t('Register with my ID')}</button>`}</div>`;
  return `${SF.back('#/events', t('All events'))}
  <div class="detail"><div class="stack">
    <div class="row" style="gap:14px"><div class="date big"><b>${e.d}</b><span>${t(e.m)}</span></div><div><span class="chip ${e.type === 'Catalyst' ? 'red' : ''}">${t(e.type)}</span><h1 class="display h1">${t(e.title)}</h1><div class="muted">${t(e.place)}</div></div></div>
    <div class="card pad"><p style="margin:0">${t(e.about)}</p></div>
    <div class="card pad"><div class="eyebrow">${t('Agenda')}</div><div class="list" style="margin-top:6px">${e.agenda.map(([h, a]) => `<div class="it"><span class="mono" style="width:52px">${h}</span><div class="grow">${t(a)}</div></div>`).join('')}</div></div>
  </div>${right}</div>`;
};

/* ---------- Catalyst ---------- */
const briefCard = (b, extra) => `<a class="card pad stack hover link" href="#/catalyst/${b.id}"><div class="row between"><span class="chip red">${t(b.guild)}</span><span class="muted small">${t('Apply by {d}', { d: t(b.due) })}</span></div>
  <div style="font-weight:700;font-size:17px">${t(b.problem)}</div>
  <div class="row" style="gap:6px"><span class="chip">${esc(b.co)}</span><span class="chip">${t('Owner')}: ${t(b.owner)}</span><span class="chip money">${t(b.budget)}</span></div>${extra || ''}</a>`;
const kanban = items => `<div class="kanban">${SF.STAGES.map((st, i) => { const col = items.filter(p => p.stage === i && p.status === 'open');
  return `<div class="col"><h4><span>${t(st)}</span><span class="muted num">${col.length}</span></h4>${col.map(p => { const b = brief(p.brief);
    return `<a class="kc link" href="${i === 3 || i === 4 ? '#/pilot/' + p.id : '#/catalyst/' + p.brief}"><b>${esc(p.startup)}</b><span class="muted small">${esc(b.co)}</span>
    ${i === 3 ? `<div class="bar"><i style="width:${p.day}%"></i></div><span class="muted num small">${t('Day {d} of 100', { d: p.day })}</span>` : ''}
    ${i === 4 ? `<span class="chip ok" style="align-self:start">${SF.uzs(p.value)}</span>` : ''}</a>`; }).join('') || `<span class="muted small" style="padding:4px">${t('None yet')}</span>`}</div>`; }).join('')}</div>`;
V.catalyst = id => {
  if (id) return V.brief(id);
  const r = role(), S = SF.S;
  if (r === 'participant') {
    const mine = S.pipeline.filter(p => p.mine);
    return `${sh(t('Catalyst'), `<span class="muted">${t('Real problems. Named owner. Pilot budget.')}</span>`)}
    ${mine.length ? `<div class="card pad stack" style="margin-bottom:18px"><div class="eyebrow">${t('My applications')}</div>${mine.map(a => { const b = brief(a.brief);
      return `<a class="stack link" style="gap:8px" href="${a.stage >= 3 ? '#/pilot/' + a.id : '#/catalyst/' + a.brief}"><div class="row between"><b>${esc(a.startup)} → ${esc(b.co)}</b><span class="chip ${a.status === 'declined' ? '' : 'warn'}">${a.status === 'declined' ? t('Not selected') : t(SF.STAGES[a.stage])}</span></div>
      <div class="steps">${SF.STAGES.map((s, i) => `<span class="${i <= a.stage && a.status !== 'declined' ? 'on' : ''}">${t(s)}</span>`).join('')}</div>${a.note ? `<div class="muted small">“${esc(a.note)}”</div>` : ''}</a>`; }).join('')}</div>` : ''}
    <div class="grid g2">${SF.BRIEFS.map(b => briefCard(b, S.pipeline.some(p => p.mine && p.brief === b.id) ? `<span class="chip ok" style="align-self:start">${t('Applied')}</span>` : '')).join('')}</div>`;
  }
  const items = r === 'company' ? S.pipeline.filter(p => p.brief === 'b1') : S.pipeline;
  const own = r === 'company' ? SF.BRIEFS.filter(b => b.co === SF.me().name || b.id === 'b1') : SF.BRIEFS;
  return `${sh(r === 'company' ? t('My Catalyst pipeline') : t('Catalyst pipeline'), r === 'company' ? `<button class="btn" data-act="newbrief">${t('Post a new brief')}</button>` : `<span class="chip ok num">${t('{c} contracts · {p} pilots running', { c: S.pipeline.filter(p => p.stage === 4).length, p: S.pipeline.filter(p => p.stage === 3).length })}</span>`)}
  ${kanban(items)}
  ${sh(r === 'company' ? t('My open briefs') : t('Open briefs'))}
  <div class="grid g2">${own.map(b => briefCard(b, `<span class="muted small">${t('{n} startups in the pipeline', { n: S.pipeline.filter(p => p.brief === b.id).length })}</span>`)).join('')}</div>`;
};
V.brief = id => {
  const b = brief(id); if (!b) return V.catalyst();
  const r = role(), S = SF.S, apps = S.pipeline.filter(p => p.brief === id), mine = apps.find(p => p.mine);
  const canDecide = r === 'company' || r === 'org';
  const side = r === 'participant'
    ? (mine ? `<div class="card pad stack"><b>${t('Your application')}</b><div class="steps">${SF.STAGES.map((s, i) => `<span class="${i <= mine.stage && mine.status !== 'declined' ? 'on' : ''}">${t(s)}</span>`).join('')}</div>
        <span class="muted small">${mine.status === 'declined' ? t('Not selected this time. The owner left a note.') : t('The owner reviews applications after {d}.', { d: t(b.due) })}</span>${mine.note ? `<div class="quote">“${esc(mine.note)}”</div>` : ''}</div>`
      : `<div class="card pad stack"><b>${t('Apply to this brief')}</b><span class="muted small">${t('+{p} points. You can track every stage here.', { p: SF.RULES.apply })}</span><button class="btn" data-act="apply" data-b="${id}">${t('Apply with my startup')}</button></div>`)
    : `<div class="card pad stack"><b>${t('Applications')}</b>${apps.map(p => `<div class="appl"><div class="row between"><b>${esc(p.startup)}</b><span class="chip ${p.status === 'declined' ? '' : p.stage ? 'ok' : 'warn'}">${p.status === 'declined' ? t('Declined') : t(SF.STAGES[p.stage])}</span></div>
        ${p.pitch ? `<div class="muted small">${t(p.pitch)}</div>` : ''}
        ${canDecide && p.stage === 0 && p.status === 'open' ? `<div class="row"><button class="btn sm" data-act="decide" data-p="${p.id}" data-ok="1">${t('Accept')}</button><button class="btn ghost sm" data-act="decide" data-p="${p.id}" data-ok="0">${t('Decline')}</button></div>`
        : canDecide && p.status === 'open' && p.stage < 3 ? `<button class="btn ghost sm" data-act="advance" data-p="${p.id}">${t('Move to {s}', { s: t(SF.STAGES[p.stage + 1]) })}</button>`
        : p.stage >= 3 ? `<a class="btn ghost sm" href="#/pilot/${p.id}">${t('Open pilot workspace')}</a>` : ''}</div>`).join('') || `<span class="muted">${t('No applications yet')}</span>`}</div>`;
  return `${SF.back('#/catalyst', t('Catalyst'))}
  <div class="detail"><div class="stack">
    <div><span class="chip red">${t(b.guild)}</span><h1 class="display h1">${t(b.problem)}</h1></div>
    <div class="row" style="gap:6px"><span class="chip">${esc(b.co)}</span><span class="chip">${t('Owner')}: ${t(b.owner)}</span><span class="chip money">${t(b.budget)}</span><span class="chip">${t('Apply by {d}', { d: t(b.due) })}</span></div>
    <div class="card pad"><div class="eyebrow">${t('The problem in detail')}</div><p style="margin:.4em 0 0">${t(b.detail)}</p></div>
    <div class="card pad"><div class="eyebrow">${t('How it works')}</div><div class="steps" style="margin-top:8px">${SF.STAGES.map(s => `<span class="on">${t(s)}</span>`).join('')}</div>
      <p class="muted small" style="margin:.6em 0 0">${t('Every brief has a named owner and a pilot budget before it goes live. Selected teams get a 100-day pilot.')}</p></div>
  </div>${side}</div>`;
};
V.pilot = id => {
  const p = SF.S.pipeline.find(x => x.id === id); if (!p) return V.catalyst();
  const b = brief(p.brief), r = role(), edit = r === 'company' || r === 'org' || p.mine, done = p.stage === 4;
  return `${SF.back('#/catalyst/' + p.brief, t('Back to the brief'))}
  <div class="detail"><div class="stack">
    <div><span class="chip red">${t('100-day pilot')}</span><h1 class="display h1">${esc(p.startup)} × ${esc(b.co)}</h1><div class="muted">${t(b.problem)}</div></div>
    <div class="card pad stack"><div class="row between"><b>${done ? t('Pilot complete') : t('Day {d} of 100', { d: p.day })}</b>${edit && !done ? `<button class="btn ghost sm" data-act="week" data-p="${id}">${t('+1 week')}</button>` : ''}</div>
      <div class="bar thick"><i style="width:${p.day}%"></i></div></div>
    <div class="card pad"><div class="eyebrow">${t('Milestones')}</div><div class="list" style="margin-top:6px">${SF.MILESTONES.map((m, i) => { const on = p.done.includes(i);
      return `<label class="it check"><input type="checkbox" data-act="milestone" data-p="${id}" data-i="${i}" ${on ? 'checked' : ''} ${edit && !done ? '' : 'disabled'}><span class="grow ${on ? 'strike' : ''}">${t(m)}</span>${on ? `<span class="chip ok">${t('Done')}</span>` : ''}</label>`; }).join('')}</div></div>
    <div class="card pad stack"><div class="eyebrow">${t('Weekly updates')}</div>
      ${edit && !done ? `<form class="row" id="update-form" data-p="${id}"><label for="up-t" class="sr">${t('Update')}</label><input id="up-t" class="input grow" placeholder="${t('What changed this week?')}"><button class="btn sm">${t('Post')}</button></form>` : ''}
      <div class="list">${p.updates.map(u => `<div class="it"><span class="chip">${esc(u.d)}</span><div class="grow">${t(u.t)}</div></div>`).join('') || `<span class="muted">${t('No updates yet')}</span>`}</div></div>
  </div>
  <div class="card pad stack">${done ? `<span class="chip ok" style="align-self:start">${t('Contract signed')}</span><div class="display" style="font-size:40px;color:var(--red)">${SF.uzs(p.value)}</div><span class="muted small">${t('Counted in “value to members” on the dashboard.')}</span>`
    : (r === 'company' || r === 'org') ? `<b>${t('Record the result')}</b><span class="muted small">${t('When the pilot ends, record the contract. It counts toward value to members.')}</span>
      <form class="stack" id="contract-form" data-p="${id}"><div class="field"><label for="c-v">${t('Contract value (UZS)')}</label><input id="c-v" inputmode="numeric" placeholder="120000000" required></div><button class="btn">${t('Record contract')}</button></form>`
    : `<b>${t('What happens next')}</b><span class="muted small">${t('At day 100 the owner decides. A contract is recorded here and shown at the festival.')}</span>`}</div></div>`;
};

/* ---------- Startup Earn ---------- */
V.earn = () => {
  const f = SF.S.filters.earn || 'All', list = SF.S.gigs.filter(g => f === 'All' || g.type === f);
  return `${sh(t('Startup Earn'), `<div class="row"><div class="filters">${['All', 'Gig', 'Job'].map(x => `<button class="btn sm ${x === f ? '' : 'ghost'}" data-act="filter" data-k="earn" data-v="${x}">${t({ All: 'All', Gig: 'Gigs', Job: 'Jobs' }[x])}</button>`).join('')}</div>
    ${role() !== 'participant' ? `<button class="btn" data-act="newgig">${t('Post a gig')}</button>` : ''}</div>`)}
  <p class="muted" style="margin:-4px 0 16px">${t('Startups, SMEs and companies post paid work. Members earn, build a track record, and get hired.')}</p>
  <div class="grid g3">${list.map(g => `<div class="card pad stack"><div class="row between"><span class="chip">${t(g.kind)} · ${t(g.region)}</span><span class="chip ${g.pay === 'Job' ? 'red' : 'money'}">${t(g.pay)}</span></div>
    <div style="font-weight:700;font-size:17px">${t(g.title)}</div><div class="muted">${t('by {x}', { x: esc(g.by) })}</div>
    ${SF.S.applied.includes(g.id) ? `<span class="chip ok" style="align-self:start">${t('Applied · they’ll message you')}</span>` : role() === 'participant' ? `<button class="btn sm" style="align-self:start" data-act="take" data-g="${g.id}">${g.type === 'Job' ? t('Apply') : t('Take this gig')}</button>` : ''}</div>`).join('')}</div>`;
};

/* ---------- Directory ---------- */
V.directory = () => {
  const sec = SF.S.filters.sec || 'All', reg = SF.S.filters.reg || 'All', sectors = ['All', ...new Set(SF.STARTUPS.map(s => s.s))];
  const list = SF.STARTUPS.filter(s => (sec === 'All' || s.s === sec) && (reg === 'All' || s.r === reg));
  const pick = ['investor', 'company', 'org'].includes(role()), sl = SF.S.shortlist;
  return `${sh(t('Startups'), `<div class="filters"><select id="f-sec" data-filter="sec" aria-label="${t('Sector')}">${sectors.map(x => `<option value="${x}" ${x === sec ? 'selected' : ''}>${t(x)}</option>`).join('')}</select>
    <select id="f-reg" data-filter="reg" aria-label="${t('Region')}"><option value="All">${t('All regions')}</option>${SF.REGIONS.map(x => `<option value="${x}" ${x === reg ? 'selected' : ''}>${t(x)}</option>`).join('')}</select></div>`)}
  ${pick ? `<div class="card pad row between" style="margin-bottom:16px"><div style="min-width:0;flex:1"><b>${t('Recommendations for your selection')}</b><div class="muted">${t('Pick startups, then ask the Startup Fest team for a curated shortlist with intros. Startups opt in to be recommended.')}</div></div>
    <button class="btn" data-act="shortlist" ${sl.length ? '' : 'disabled'}>${t('Request shortlist ({n})', { n: sl.length })}</button></div>` : ''}
  <div class="grid g3">${list.map(s => `<div class="card pad stack"><div class="row between"><b style="font-size:17px">${esc(s.n)}</b><span class="chip">${t(s.st)}</span></div>
    <div>${t(s.t)}</div><div class="row" style="gap:6px"><span class="chip red">${t(s.s)}</span><span class="chip">${t(s.r)}</span><span class="chip">${t('Team of {n}', { n: s.team })}</span>${s.badges.map(b => `<span class="chip ok">${t(b)}</span>`).join('')}</div>
    <div class="row">${pick ? `<button class="btn ${sl.includes(s.n) ? '' : 'ghost'} sm" data-act="pick" data-n="${esc(s.n)}">${sl.includes(s.n) ? '✓ ' + t('Picked') : t('Pick')}</button>` : ''}
    <button class="btn ghost sm" data-act="intro" data-n="${esc(s.n)}">${role() === 'mentor' ? t('Offer office hours') : t('Request intro')}</button></div></div>`).join('') || `<div class="card empty">${t('No startups match these filters yet.')}</div>`}</div>`;
};

/* ---------- Messages ---------- */
V.messages = () => {
  const S = SF.S, th = S.threads.find(x => x.id === S.cur) || S.threads[0];
  return `${sh(t('Messages'), `<span class="muted">${t('Founders, companies, mentors and investors in one place')}</span>`)}
  <div class="card chat"><div class="threads">${S.threads.map(x => `<button class="th" data-act="thread" data-th="${x.id}" aria-current="${x.id === th.id}"><span class="mini" style="background:${SF.ROLES[x.role].color}">${SF.initials(x.who)}</span>
    <span style="min-width:0"><b>${esc(x.who)}</b><br><span class="muted small ellipsis">${t(x.msgs[x.msgs.length - 1].t)}</span></span></button>`).join('')}</div>
  <div class="msgs"><div class="row" style="padding:12px 16px;border-bottom:1px solid var(--line)"><span class="mini" style="background:${SF.ROLES[th.role].color}">${SF.initials(th.who)}</span><div><b>${esc(th.who)}</b><div class="muted small">${t(SF.ROLES[th.role].label)}</div></div></div>
    <div class="scroll" id="scroll">${th.msgs.map(m => `<div class="bubble ${m.me ? 'me' : ''}">${m.me ? esc(m.t) : t(m.t)}</div>`).join('')}</div>
    <form class="compose" id="compose"><label for="msg" class="sr">${t('Message')}</label><input id="msg" placeholder="${t('Write a message…')}" autocomplete="off"><button class="btn">${t('Send')}</button></form></div></div>`;
};

/* ---------- Community ---------- */
V.community = () => `${sh(t('Industry guilds'), `<span class="muted">${t('Catalyst by sector. A new guild opens after 5+ pilots.')}</span>`)}
  <div class="grid g3">${SF.GUILDS.map(g => `<div class="card pad stack ${g.st === 'Active' ? '' : 'pin'}"><div class="row between"><b style="font-size:17px">${t(g.n)}</b><span class="chip ${g.st === 'Active' ? 'ok' : ''}">${t(g.st === 'Active' ? 'Active' : 'After 5+ pilots')}</span></div>
   ${g.st === 'Active' ? `<div class="row muted num small"><span>${t('{n} member companies', { n: g.co })}</span><span>·</span><span>${t('{n} pilots', { n: g.p })}</span></div>` : `<div class="muted small">${t('Opens when the active guilds prove the model')}</div>`}</div>`).join('')}</div>
  ${sh(t('Regional councils'), `<span class="muted">${t('One table per region · max 2 seats per sector · 1-year terms')}</span>`)}
  <div class="card tablewrap"><table><thead><tr><th>${t('Region')}</th><th>${t('Council')}</th><th>${t('Members')}</th><th>${t('Events this month')}</th></tr></thead>
  <tbody>${SF.COUNCILS.map(c => `<tr><td><b>${t(c.r)}</b></td><td><span class="chip ${c.st === 'Pilot council' ? 'ok' : c.st === 'Forming' ? 'warn' : ''}">${t(c.st)}</span></td><td class="num">${SF.fmt(c.m)}</td><td class="num">${c.ev}</td></tr>`).join('')}</tbody></table></div>`;

/* ---------- My ID ---------- */
V.me = () => {
  const r = role(), p = SF.me(), R = SF.ROLES[r], lv = SF.level(p.points), b = SF.badges(r);
  const fk = SF.FIELD_ON_CARD[r], extra = p.fields[fk];
  const pct = lv.next ? Math.round((p.points - lv.cur[1]) / (lv.next[1] - lv.cur[1]) * 100) : 100;
  return `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));align-items:start">
  <div class="stack" style="align-items:center">
    <div class="idcard" style="--idc:${R.color}"><div class="head"><div><div class="role">${t(R.label).toUpperCase()}</div><div class="sub">${t('STARTUP FEST ID')}</div></div>${SF.SPARK.replace('class="spark"', 'class="spark" style="width:22px;height:22px"')}</div>
      <div class="body"><div class="avatar">${SF.initials(p.name)}</div><div style="font-weight:700;font-size:19px">${esc(p.name)}</div><div class="muted small">${t(p.region)}${extra ? ' · ' + esc(t(extra)) : ''}</div>
      <div class="row" style="justify-content:center;gap:6px"><span class="chip" style="color:${R.color}">${t(lv.cur[0])}</span>${b.map(x => `<span class="chip" style="color:${R.color}">${t(x)}</span>`).join('')}</div>
      <div class="qr" id="qr" data-qr="${p.id}"></div><div class="mono muted">${p.id}</div></div></div>
    <p class="muted center" style="max-width:34ch;margin:0">${t('Show this QR at any Startup Fest event to check in. Your badges and points update automatically.')}</p>
  </div>
  <div class="stack">
    <div class="card pad row between"><div><div class="eyebrow">${t('Points')}</div><div class="display" style="font-size:44px;color:var(--red)">${p.points}</div></div>
      <div style="flex:1;min-width:180px"><div class="row between muted small"><span>${lv.next ? t('Next: {l}', { l: t(lv.next[0]) }) : t('Top level')}</span><span class="num">${lv.next ? p.points + '/' + lv.next[1] : ''}</span></div>
      <div class="bar" style="margin-top:6px"><i style="width:${pct}%"></i></div><div class="muted" style="font-size:12px;margin-top:6px">${SF.LEVELS.map(l => t(l[0])).join(' → ')}</div></div></div>
    <div class="card pad"><div class="eyebrow">${t('Badges')}</div><div class="row" style="gap:6px;margin-top:8px">${Object.keys(SF.BADGES).map(x => `<span class="chip ${b.includes(x) ? 'red' : ''}" title="${b.includes(x) ? '' : t('Not earned yet')}">${b.includes(x) ? '★ ' : ''}${t(x)}</span>`).join('')}</div></div>
    <div class="card pad"><div class="eyebrow">${t('Activity')}</div><div class="list" style="margin-top:6px">${p.log.slice(0, 8).map(l => `<div class="it"><div class="grow">${esc(t(l.t))}</div><span class="chip red num">+${l.p}</span></div>`).join('') || `<span class="muted">${t('Nothing yet. Register for an event to earn your first points.')}</span>`}</div></div>
    <div class="card pad row between"><div><b>${t('New here?')}</b><div class="muted">${t('Create your own ID to see the sign-up flow.')}</div></div><button class="btn" data-act="join">${t('Get a Startup Fest ID')}</button></div>
  </div></div>`;
};

/* ---------- Org dashboard ---------- */
V.admin = () => {
  const m = SF.metrics();
  const tiles = [[SF.fmt(m.members), 'members with an ID'], [SF.fmt(m.mam), 'monthly active'], [String(m.running), 'pilots running'], [String(m.contracts), 'contracts signed'], [String(m.paying), 'paying companies'], [SF.uzs(m.valueUZS), 'value to members (recorded)']];
  return `${sh(t('Community dashboard'), `<span class="muted">${t('North stars: monthly active members and value members gained')}</span>`)}
  <div class="grid g3">${tiles.map(([a, b], i) => `<div class="card pad tile ${i < 2 ? '' : 'pin'}"><b class="num">${a}</b><span class="muted">${t(b)}</span></div>`).join('')}</div>
  ${sh(t('Regions'), `<span class="muted">${t('Ranked by members')}</span>`)}
  <div class="card tablewrap"><table><thead><tr><th>#</th><th>${t('Region')}</th><th>${t('Members')}</th><th>${t('Events this month')}</th><th>${t('Council')}</th></tr></thead>
  <tbody>${[...SF.COUNCILS].sort((a, b) => b.m - a.m).map((c, i) => `<tr><td class="num">${i + 1}</td><td><b>${t(c.r)}</b></td><td class="num">${SF.fmt(c.m)}</td><td class="num">${c.ev}</td><td><span class="chip ${c.st === 'Pilot council' ? 'ok' : c.st === 'Forming' ? 'warn' : ''}">${t(c.st)}</span></td></tr>`).join('')}</tbody></table></div>
  <p class="muted small">${t('All figures are sample data for the demo.')}</p>`;
};

/* ---------- Roadmap ---------- */
V.roadmap = () => `${sh(t('Platform roadmap'), `<span class="muted">${t('From demo to a national platform')}</span>`)}
  <div class="timeline">${SF.ROADMAP.map(([v, n, d, st]) => `<div class="tl ${st}"><div class="tl-v">${v}</div><div class="card pad stack" style="gap:6px"><div class="row between"><b style="font-size:17px">${t(n)}</b>
    <span class="chip ${st === 'done' ? 'ok' : st === 'now' ? 'red' : st === 'next' ? 'warn' : ''}">${t({ done: 'Done', now: 'This version', next: 'Next', later: 'Planned' }[st])}</span></div><div class="muted">${t(d)}</div></div></div>`).join('')}</div>`;
})();
