// v3 views: the season, council pages, startup profiles, Startup Earn lifecycle, CSV export
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, V = SF.V;
const role = () => SF.S.role;
const sh = (title, right = '') => `<div class="sec-h"><h2>${title}</h2>${right}</div>`;
const enc = encodeURIComponent;
SF.payUZS = p => { const m = String(p).match(/([\d.]+)\s*([MK])?/i); if (!m) return 0; return Math.round(parseFloat(m[1]) * (m[2] ? (m[2].toUpperCase() === 'M' ? 1e6 : 1e3) : 1)); };
SF.earnings = name => Object.entries(SF.S.gigState).filter(([, g]) => g.st === 3 && g.who === name).reduce((a, [id, g]) => a + (g.uzs || 0), 0);
const leader = (r, tr) => SF.TEAMS.filter(x => x.r === r && x.tr === tr).sort((a, b) => SF.S.teamPts[b.n] - SF.S.teamPts[a.n])[0];

/* ---------- Home: season strip under the hero ---------- */
const home0 = V.home;
V.home = () => { const h = home0(), i = h.indexOf('</section>') + 10, n = Object.keys(SF.S.finalists).length;
  const strip = `<a class="card pad season-strip link" href="#/season"><div class="row" style="gap:14px">${SF.icon('season')}<div class="grow"><b>${t('Season 2027')}</b>
    <div class="muted small">${t('Campus round → Regional stage → National Final · prize pool {p}', { p: SF.uzs(SF.PRIZE_UZS) })}</div></div>
    <span class="chip red num">${t('{n} of 28 finalists picked', { n })}</span></div></a>`;
  return h.slice(0, i) + strip + h.slice(i); };

/* ---------- Season ---------- */
V.season = () => {
  const S = SF.S, tr = S.filters.track || SF.TRACKS[0], org = role() === 'org', me = SF.me('participant');
  const myTeam = SF.TEAMS.find(x => x.n === me.fields.team);
  const fin = Object.entries(S.finalists);
  const myCard = role() === 'participant' && myTeam ? (() => { const inRegion = SF.TEAMS.filter(x => x.r === myTeam.r && x.tr === myTeam.tr).sort((a, b) => S.teamPts[b.n] - S.teamPts[a.n]);
    const rank = inRegion.findIndex(x => x.n === myTeam.n) + 1, isFin = S.finalists[myTeam.r + '|' + myTeam.tr] === myTeam.n;
    return `<div class="card pad row between" style="margin-bottom:16px;border-color:var(--red)"><div><div class="eyebrow">${t('My season')}</div><b style="font-size:19px">${esc(myTeam.n)}</b>
      <div class="muted small">${t(myTeam.r)} · ${t(myTeam.tr)} · ${t('#{r} in the region', { r: rank })}</div></div>
      <div class="row"><span class="display num" style="font-size:36px;color:var(--red)">${S.teamPts[myTeam.n]}</span><span class="muted small">${t('points')}</span>
      <span class="chip ${isFin ? 'ok' : 'warn'}">${isFin ? t('Invited to the National Final') : t('Regional stage in June')}</span></div></div>`; })() : '';
  return `${sh(t('Season 2027'), `<span class="chip money">${t('Prize pool {p}', { p: SF.uzs(SF.PRIZE_UZS) })}</span>`)}
  ${myCard}
  <div class="grid g3">${SF.SEASON_STAGES.map((s, i) => `<div class="card pad stack ${i === 2 ? 'final-card' : ''}"><div class="row between"><span class="eyebrow" style="color:${i === 2 ? '#fff' : 'var(--red)'}">${t('Stage {n}', { n: i + 1 })}</span><span class="small">${t(s.when)}</span></div>
    <b style="font-size:20px">${t(s.name)}</b><span class="${i === 2 ? '' : 'muted'} small">${t(s.about)}</span></div>`).join('')}</div>
  ${sh(t('Regional leaderboard'), `<div class="filters">${SF.TRACKS.map(x => `<button class="btn sm ${x === tr ? '' : 'ghost'}" data-act="filter" data-k="track" data-v="${x}">${t(x)}</button>`).join('')}</div>`)}
  <div class="card tablewrap"><table><thead><tr><th>${t('Region')}</th><th>${t('Leading team')}</th><th>${t('Points')}</th><th>${t('National Final')}</th></tr></thead><tbody>
  ${SF.REGIONS.map(r => { const L = leader(r, tr), f = S.finalists[r + '|' + tr];
    return `<tr><td><a href="#/council/${enc(r)}"><b>${t(r)}</b></a></td><td>${L ? `<a href="#/startup/${enc(L.n)}">${esc(L.n)}</a>` : `<span class="muted">${t('No team yet')}</span>`}</td><td class="num">${L ? S.teamPts[L.n] : '–'}</td>
    <td>${f ? `<span class="chip ok">${esc(f)}</span>` : L && org ? `<button class="btn ghost sm" data-act="finalist" data-key="${esc(r + '|' + tr)}" data-team="${esc(L.n)}">${t('Pick as finalist')}</button>` : `<span class="muted small">${t('After the regional stage')}</span>`}</td></tr>`; }).join('')}
  </tbody></table></div>
  ${sh(t('National Final line-up'), `<span class="muted">${t('{n} regional finalists + {w} Startup Weekend wildcards', { n: fin.length, w: SF.WILDCARDS.length })}</span>`)}
  <div class="grid g4">${fin.map(([k, n]) => { const [r, x] = k.split('|'); return `<a class="card pad stack link hover" href="#/startup/${enc(n)}"><b>${esc(n)}</b><span class="muted small">${t(r)} · ${t(x)}</span></a>`; }).join('')}
  ${SF.WILDCARDS.map(([n, from]) => `<div class="card pad stack pin"><b>${esc(n)}</b><span class="chip red" style="align-self:start">${t('Wildcard')}</span><span class="muted small">${t(from)}</span></div>`).join('')}</div>`;
};

/* ---------- Council page ---------- */
V.council = r => {
  r = decodeURIComponent(r || ''); const c = SF.COUNCILS.find(x => x.r === r); if (!c) return V.community();
  const S = SF.S, seats = S.seats[r] || [], probs = S.problems[r] || [], org = role() === 'org';
  const cnt = ty => seats.filter(s => s[1] === ty).length;
  const pilots = S.pipeline.filter(p => (SF.STARTUPS.find(x => x.n === p.startup) || {}).r === r && p.stage >= 3).length;
  return `${SF.back('#/community', t('Community'))}
  <div class="row between"><div><span class="chip ${c.st === 'Pilot council' ? 'ok' : c.st === 'Forming' ? 'warn' : ''}">${t(c.st)}</span><h1 class="display h1">${t('{r} council', { r: t(r) })}</h1></div></div>
  <div class="grid g4" style="margin-top:14px">${[[SF.fmt(c.m), 'members'], [String(c.ev), 'events this month'], [String(pilots), 'pilots from this region'], [String(seats.length) + '/12', 'seats filled']]
    .map(([a, b]) => `<div class="card pad tile"><b class="num">${a}</b><span class="muted">${t(b)}</span></div>`).join('')}</div>
  <div class="detail" style="margin-top:18px"><div class="stack">
    <div class="card pad"><div class="row between"><div class="eyebrow">${t('Seats · max 2 per sector')}</div></div>
      <div class="seat-grid">${SF.SEAT_TYPES.map(ty => `<div class="seat-type"><div class="row between"><b>${t(ty)}</b><span class="chip ${cnt(ty) >= 2 ? 'red' : ''} num">${cnt(ty)}/2</span></div>
        ${seats.filter(s => s[1] === ty).map(s => `<div class="small"><b>${esc(s[0])}</b> · <span class="muted">${esc(s[2])}</span></div>`).join('') || `<div class="muted small">${t('Open seat')}</div>`}</div>`).join('')}</div>
      ${org ? `<form id="seat-form" data-r="${esc(r)}" class="row" style="margin-top:12px"><label for="s-name" class="sr">${t('Name')}</label><input id="s-name" class="input grow" placeholder="${t('Name')}" required>
        <label for="s-org" class="sr">${t('Organisation')}</label><input id="s-org" class="input grow" placeholder="${t('Organisation')}">
        <label for="s-type" class="sr">${t('Sector')}</label><select id="s-type" class="input">${SF.SEAT_TYPES.map(x => `<option value="${x}">${t(x)}</option>`).join('')}</select><button class="btn">${t('Add seat')}</button></form>`
      : `<div class="row" style="margin-top:12px"><button class="btn ghost sm" data-act="seatreq" data-r="${esc(r)}">${t('Apply for a seat')}</button><span class="muted small">${t('Terms are 1 year, max 2 terms.')}</span></div>`}</div>
    <div class="card pad stack"><div class="eyebrow">${t('Local problem bank')}</div>
      <div class="list">${probs.map(p => `<div class="it"><button class="btn ghost sm" data-act="pvote" data-r="${esc(r)}" data-id="${p.id}" aria-label="${t('Upvote')}">▲ <span class="num">${p.v}</span></button>
        <div class="grow"><div class="t">${t(p.t)}</div><div class="s">${t('from: {x}', { x: t(p.by) })}</div></div>
        ${p.brief ? `<span class="chip ok">${t('Sent to Catalyst')}</span>` : org ? `<button class="btn sm" data-act="tobrief" data-r="${esc(r)}" data-id="${p.id}">${t('Turn into a brief')}</button>` : ''}</div>`).join('') || `<span class="muted">${t('No problems yet. Add the first one.')}</span>`}</div>
      <form id="problem-form" data-r="${esc(r)}" class="row"><label for="pb-t" class="sr">${t('Problem')}</label><input id="pb-t" class="input grow" placeholder="${t('A real problem a local business or office has')}" required><button class="btn sm">${t('Submit')}</button></form></div>
  </div>
  <div class="card pad stack"><b>${t('How councils work')}</b><div class="list">${[['Collect local problems', 'For Catalyst, every quarter'], ['Host and select', 'Catalyst days, regional finalists'], ['Report results', 'Pilots, contracts, jobs'], ['Rotate', '1-year terms, max 2']]
    .map(([a, b], i) => `<div class="it"><span class="display" style="font-size:26px;color:var(--red);width:22px">${i + 1}</span><div class="grow"><div class="t">${t(a)}</div><div class="s">${t(b)}</div></div></div>`).join('')}</div></div></div>`;
};

/* ---------- Community: council rows link to pages ---------- */
const comm0 = V.community;
V.community = () => comm0().replace(/<td><b>([^<]+)<\/b><\/td>/g, (m, name) => { const r = SF.REGIONS.find(x => t(x) === name) || name; return `<td><a href="#/council/${enc(r)}"><b>${name}</b></a></td>`; });

/* ---------- Startup profile ---------- */
V.startup = n => {
  n = decodeURIComponent(n || ''); const s = SF.STARTUPS.find(x => x.n === n), team = SF.TEAMS.find(x => x.n === n);
  if (!s && !team) return V.directory();
  const S = SF.S, info = SF.STARTUP_INFO[n] || {}, consent = S.consent[n] !== false, own = (role() === 'participant' && info.owner === 'participant') || role() === 'org';
  const hist = S.pipeline.filter(p => p.startup === n);
  const pick = ['investor', 'company', 'org', 'sme', 'scout'].includes(role());
  return `${SF.back('#/directory', t('Startups'))}
  <div class="detail"><div class="stack">
    <div><div class="row" style="gap:6px">${s ? `<span class="chip red">${t(s.s)}</span><span class="chip">${t(s.st)}</span>` : ''}<span class="chip">${t((s || team).r)}</span></div><h1 class="display h1">${esc(n)}</h1>${s ? `<div style="font-size:17px">${t(s.t)}</div>` : ''}</div>
    <div class="grid g3">${[[info.founder || '–', 'Founder'], [info.year || '–', 'Founded'], [s ? s.team : '–', 'Team size']].map(([a, b]) => `<div class="card pad"><div class="eyebrow">${t(b)}</div><b style="font-size:17px">${esc(a)}</b></div>`).join('')}</div>
    <div class="card pad stack"><div class="eyebrow">${t('Catalyst history')}</div>${hist.map(p => { const b = SF.BRIEFS.find(x => x.id === p.brief);
      return `<a class="row between link" href="${p.stage >= 3 ? '#/pilot/' + p.id : '#/catalyst/' + p.brief}"><span>${esc(b.co)} · ${t(b.guild)}</span><span class="chip ${p.stage === 4 ? 'ok' : 'warn'}">${p.status === 'declined' ? t('Not selected') : p.stage === 4 ? SF.uzs(p.value) : t(SF.STAGES[p.stage])}</span></a>`; }).join('') || `<span class="muted">${t('No Catalyst applications yet')}</span>`}</div>
    ${team ? `<div class="card pad row between"><div><div class="eyebrow">${t('Season 2027')}</div><b>${t(team.tr)}</b></div><span class="display num" style="font-size:32px;color:var(--red)">${S.teamPts[n]} <span class="small muted" style="font-family:var(--f-body)">${t('points')}</span></span></div>` : ''}
  </div>
  <div class="card pad stack">${s ? `<div class="row" style="gap:6px">${s.badges.map(b => `<span class="chip ok">${t(b)}</span>`).join('')}</div>` : ''}
    <div class="row between"><b>${t('Open to recommendations')}</b>${own ? `<label class="switch"><input type="checkbox" data-act="consent" data-n="${esc(n)}" ${consent ? 'checked' : ''}><span></span><span class="sr">${t('Open to recommendations')}</span></label>` : `<span class="chip ${consent ? 'ok' : ''}">${consent ? t('Yes') : t('No')}</span>`}</div>
    <span class="muted small">${consent ? t('Startup Fest can recommend this startup to investors, companies and scouting partners.') : t('This startup is not shared with partners. It can still apply to briefs and the season.')}</span>
    <div class="row">${pick && consent ? `<button class="btn ${S.shortlist.includes(n) ? '' : 'ghost'} sm" data-act="pick" data-n="${esc(n)}">${S.shortlist.includes(n) ? '✓ ' + t('Picked') : t('Pick')}</button>` : ''}
      <button class="btn sm" data-act="intro" data-n="${esc(n)}">${role() === 'mentor' ? t('Offer office hours') : t('Request intro')}</button></div></div></div>`;
};

/* ---------- Directory: profile links, consent, request status ---------- */
const dir0 = V.directory;
V.directory = () => {
  let h = dir0(); const S = SF.S;
  SF.STARTUPS.forEach(s => { const nm = esc(s.n);
    h = h.replace(`<b style="font-size:17px">${nm}</b>`, `<a href="#/startup/${enc(s.n)}"><b style="font-size:17px">${nm}</b></a>${S.consent[s.n] === false ? ` <span class="chip">${t('Not open to recommendations')}</span>` : ''}`);
    if (S.consent[s.n] === false) h = h.replace(new RegExp(`<button class="btn (ghost )?sm" data-act="pick" data-n="${nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">[^<]*</button>`), ''); });
  const mine = role() === 'org' ? S.requests : S.requests.filter(r => r.by === SF.me().name);
  if (['investor', 'company', 'org', 'sme', 'scout'].includes(role()) && mine.length) h += `${sh(role() === 'org' ? t('Shortlist requests') : t('My shortlist requests'))}
    <div class="card tablewrap"><table><thead><tr><th>${t('From')}</th><th>${t('Startups')}</th><th>${t('Status')}</th>${role() === 'org' ? '<th></th>' : ''}</tr></thead><tbody>
    ${mine.map(r => `<tr><td>${esc(r.by)}</td><td>${r.list.map(esc).join(', ')}</td><td><span class="chip ${r.status === 'Sent' ? 'ok' : 'warn'}">${t(r.status)}</span></td>
      ${role() === 'org' ? `<td>${r.status !== 'Sent' ? `<button class="btn ghost sm" data-act="reqnext" data-id="${r.id}">${t(r.status === 'Requested' ? 'Start curating' : 'Send shortlist')}</button>` : ''}</td>` : ''}</tr>`).join('')}</tbody></table></div>`;
  return h;
};

/* ---------- Startup Earn lifecycle ---------- */
V.earn = () => {
  const S = SF.S, f = S.filters.earn || 'All', list = S.gigs.filter(g => f === 'All' || g.type === f), r = role(), me = SF.me();
  const poster = r === 'company' || r === 'org';
  return `${sh(t('Startup Earn'), `<div class="row"><div class="filters">${['All', 'Gig', 'Job'].map(x => `<button class="btn sm ${x === f ? '' : 'ghost'}" data-act="filter" data-k="earn" data-v="${x}">${t({ All: 'All', Gig: 'Gigs', Job: 'Jobs' }[x])}</button>`).join('')}</div>
    ${r !== 'participant' ? `<button class="btn" data-act="newgig">${t('Post a gig')}</button>` : ''}</div>`)}
  <p class="muted" style="margin:-4px 0 16px">${t('Startups, SMEs and companies post paid work. Members earn, build a track record, and get hired.')}</p>
  <div class="grid g3">${list.map(g => { const st = S.gigState[g.id] || (S.gigState[g.id] = { st: 0 }), mineG = st.who === me.name;
    const steps = g.type === 'Gig' ? `<div class="steps">${SF.GIG_STEPS.map((x, i) => `<span class="${i <= st.st ? 'on' : ''}">${t(x)}</span>`).join('')}</div>` : '';
    let act = '';
    if (g.type === 'Job') act = S.applied.includes(g.id) ? `<span class="chip ok" style="align-self:start">${t('Applied · they’ll message you')}</span>` : r === 'participant' ? `<button class="btn sm" style="align-self:start" data-act="take" data-g="${g.id}">${t('Apply')}</button>` : '';
    else if (st.st === 0) act = r === 'participant' ? `<button class="btn sm" style="align-self:start" data-act="gigtake" data-g="${g.id}">${t('Take this gig')}</button>` : `<span class="muted small">${t('Waiting for a member')}</span>`;
    else if (st.st === 1) act = mineG ? `<button class="btn sm" style="align-self:start" data-act="gigdeliver" data-g="${g.id}">${t('Mark as delivered')}</button>` : `<span class="muted small">${t('Assigned to {n}', { n: esc(st.who) })}</span>`;
    else if (st.st === 2) act = poster ? `<button class="btn sm" style="align-self:start" data-act="gigpay" data-g="${g.id}">${t('Confirm and pay')}</button>` : `<span class="muted small">${t('Delivered · waiting for payment')}</span>`;
    else act = `<span class="chip ok" style="align-self:start">${t('Paid {v}', { v: SF.uzs(st.uzs || SF.payUZS(g.pay)) })}${st.rating ? ' · ' + '★'.repeat(st.rating) : ''}</span>`;
    return `<div class="card pad stack"><div class="row between"><span class="chip">${t(g.kind)} · ${t(g.region)}</span><span class="chip ${g.pay === 'Job' ? 'red' : 'money'}">${t(g.pay)}</span></div>
      <div style="font-weight:700;font-size:17px">${t(g.title)}</div><div class="muted">${t('by {x}', { x: esc(g.by) })}</div>${steps}${act}</div>`; }).join('')}</div>`;
};

/* ---------- My ID: earnings and season ---------- */
const me0 = V.me;
V.me = () => { const h = me0(); if (role() !== 'participant') return h; const p = SF.me(), e = SF.earnings(p.name), team = SF.TEAMS.find(x => x.n === p.fields.team);
  const card = `<div class="card pad row between"><div><div class="eyebrow">${t('Earned on Startup Earn')}</div><div class="display" style="font-size:34px;color:var(--red)">${SF.uzs(e)}</div></div>
    ${team ? `<a class="btn ghost sm" href="#/season">${t('My season: {n} points', { n: SF.S.teamPts[team.n] })}</a>` : ''}</div>`;
  return h.replace('<div class="card pad"><div class="eyebrow">' + t('Badges'), card + '<div class="card pad"><div class="eyebrow">' + t('Badges')); };

/* ---------- Dashboard: gig earnings + CSV ---------- */
const adm0 = V.admin;
V.admin = () => { const gigUZS = Object.values(SF.S.gigState).filter(g => g.st === 3).reduce((a, g) => a + (g.uzs || 0), 0);
  return adm0().replace(`<p class="muted small">${t('All figures are sample data for the demo.')}</p>`, `<div class="card pad row between" style="margin-top:16px"><div><b>${t('Paid to members via Startup Earn')}</b><div class="muted small">${t('Also counted as value to members')}</div></div><b class="display num" style="font-size:30px;color:var(--red)">${SF.uzs(gigUZS)}</b></div>
  <div class="row" style="margin-top:16px"><button class="btn ghost sm" data-act="csv" data-k="regions">${t('Export regions (CSV)')}</button><button class="btn ghost sm" data-act="csv" data-k="pipeline">${t('Export Catalyst pipeline (CSV)')}</button><button class="btn ghost sm" data-act="csv" data-k="season">${t('Export season leaderboard (CSV)')}</button></div>
  <p class="muted small">${t('All figures are sample data for the demo.')}</p>`); };
})();
