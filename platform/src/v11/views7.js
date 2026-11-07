// v7 views: Verified Investor Programme, deal flow and deal rooms, founder fundraising, VC Battle
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, V = SF.V;
const S = () => SF.S, role = () => SF.S.role, R = k => SF.ROLES[k];
const sh = (title, right = '') => `<div class="sec-h"><h2>${title}</h2>${right}</div>`;
SF.who = () => SF.me().name;
SF.rounds = () => [...SF.RAISING, ...(S().roundsNew || [])];
SF.round = n => SF.rounds().find(r => r.n === n);
SF.dealOf = n => S().deal[n] = S().deal[n] || { commits: [], access: {}, nda: [], qa: [], docs: [] };
SF.committed = n => SF.dealOf(n).commits.reduce((a, c) => a + c.amt, 0);
SF.isVip = (n = SF.who()) => (S().vip[n] || {}).status === 'Verified';
SF.myTeam = () => SF.me('participant').fields.team;
SF.stageOf = (n, inv = SF.who()) => { const d = SF.dealOf(n);
  if (S().investments.some(x => x.by === inv && x.startup === n)) return 'Invested';
  if (d.commits.some(c => c.by === inv)) return 'Committed';
  if (d.access[inv] === 'granted' && d.nda.includes(inv)) return 'In data room';
  if (d.access[inv]) return 'Access requested';
  return ((S().watch[inv] || []).includes(n)) ? 'Watching' : ''; };
SF.capital = () => S().investments.reduce((a, x) => a + x.amt, 0);
const pct = n => { const r = SF.round(n); return r ? Math.min(100, Math.round(SF.committed(n) / r.ask * 100)) : 0; };
const bar = n => `<div class="row between small"><span><b class="num">${SF.usd(SF.committed(n))}</b> ${t('of {a}', { a: SF.usd(SF.round(n).ask) })}</span><span class="muted num">${pct(n)}%</span></div><div class="bar thick" style="margin-top:6px"><i style="width:${pct(n)}%"></i></div>`;
const vipChip = n => SF.isVip(n) ? `<span class="chip vip">✓ ${t('Verified investor')}</span>` : '';

/* ---------- Verified Investor Programme ---------- */
V.verify = () => { const me = SF.who(), v = S().vip[me];
  if (role() === 'org') return V.deals();
  const needs = `<div class="list">${SF.VIP_NEEDS.map(([k, x]) => `<div class="it"><span class="chk-dot ${v && (v.checks || []).includes(k) ? 'on' : ''}">${v && (v.checks || []).includes(k) ? '✓' : ''}</span><div class="grow">${t(x)}</div></div>`).join('')}</div>`;
  const head = `<section class="panel black vip-hero"><div class="vip-star" aria-hidden="true">${SF.STAR(260, '#e01a09')}</div><div class="eyebrow" style="color:#fff;opacity:.7">${t('For investors')}</div>
    <h1 class="display" style="font-size:clamp(40px,5.5vw,76px);margin-top:8px">${t('VERIFIED INVESTOR PROGRAMME')}</h1>
    <p style="max-width:56ch;font-size:18px;font-weight:300">${t('Founders share data rooms only with verified investors. Verification is free and takes about a week.')}</p>
    <div class="row">${SF.VIP_PERKS.map(x => `<span class="chip" style="background:#ffffff1f;color:#fff">${t(x)}</span>`).join('')}</div></section>`;
  if (v && v.status === 'Verified') return `${head}<div class="grid g2" style="margin-top:16px;align-items:start"><div class="card pad stack vip-cert"><span class="chip vip" style="align-self:start">✓ ${t('Verified investor')}</span><b class="display" style="font-size:40px">${esc(me)}</b>
    <div class="muted">${t(v.kind)} · ${t('since {d}', { d: v.since })} · ${t('renews {d}', { d: v.renews })}</div>${needs}<a class="cta" href="#/deals" style="align-self:start"><span class="btn">${t('Open deal flow')}</span>${SF.ARROW}</a></div>
    <div class="card pad stack"><b>${t('Investor code of conduct')}</b><div class="list">${SF.VIP_CODE.map(x => `<div class="it"><span>•</span><div class="grow">${t(x)}</div></div>`).join('')}</div></div></div>`;
  if (v && /Submitted|Under review/.test(v.status)) return `${head}<div class="card pad stack" style="margin-top:16px"><span class="chip warn" style="align-self:start">${t(v.status)}</span><b>${t('Thanks. The Startup Fest team is checking your application.')}</b><span class="muted">${t('You will get a notification. Until then you can browse rounds, but data rooms stay closed.')}</span>${needs}</div>`;
  return `${head}<div class="grid g2" style="margin-top:16px;align-items:start">
    <form id="vip-form" class="card pad stack"><b style="font-size:18px">${t('Apply for verification')}</b>
      <div class="two"><div class="field"><label for="vp-kind">${t('Investor type')}</label><select id="vp-kind">${['Angel', 'Venture fund', 'Corporate VC', 'Family office'].map(x => `<option value="${x}">${t(x)}</option>`).join('')}</select></div>
      <div class="field"><label for="vp-deals">${t('Startup investments so far')}</label><select id="vp-deals">${['0', '1', '2–5', '6+'].map(x => `<option>${x}</option>`).join('')}</select></div></div>
      <div class="field"><label for="vp-id">${t('Passport or ID card number')}</label><input id="vp-id" required placeholder="AB1234567" autocomplete="off"><span class="hint">${t('We only keep the last 4 characters after the check.')}</span></div>
      <div class="field"><label for="vp-note">${t('Your track record in two lines')}</label><textarea id="vp-note" required></textarea></div>
      <label class="chk wide req"><input type="checkbox" id="vp-funds"><span>${t('I can invest at least $10K in startups this year')}</span></label>
      <label class="chk wide req"><input type="checkbox" id="vp-code"><span>${t('I accept the investor code of conduct')}</span></label>
      <button class="cta" type="submit" style="align-self:start"><span class="btn">${t('Send for verification')}</span>${SF.ARROW}</button></form>
    <div class="card pad stack"><b>${t('What we check')}</b>${needs}<b>${t('Investor code of conduct')}</b><div class="list">${SF.VIP_CODE.map(x => `<div class="it"><span>•</span><div class="grow">${t(x)}</div></div>`).join('')}</div></div></div>`;
};

/* ---------- Deal flow ---------- */
const roundCard = (r, inv) => { const st = SF.stageOf(r.n, inv), watching = (S().watch[inv] || []).includes(r.n), d = SF.dealOf(r.n);
  const act = !SF.isVip(inv) ? `<a class="btn ghost sm" href="#/verify">${t('Get verified to open')}</a>`
    : st === 'In data room' || st === 'Committed' || st === 'Invested' ? `<a class="btn sm" href="#/deal/${encodeURIComponent(r.n)}">${t('Open deal room')}</a>`
    : d.access[inv] === 'granted' ? `<a class="btn sm" href="#/deal/${encodeURIComponent(r.n)}">${t('Sign the NDA')}</a>`
    : d.access[inv] === 'requested' ? `<span class="chip warn">${t('Waiting for the founder')}</span>` : d.access[inv] === 'denied' ? `<span class="chip">${t('Not this time')}</span>`
    : `<button class="btn sm" data-act="dealreq" data-n="${esc(r.n)}">${t('Request access')}</button>`;
  return `<div class="card pad stack round-card"><div class="row between"><div><b style="font-size:19px">${esc(r.n)}</b><div class="muted small">${t((SF.STARTUPS.find(s => s.n === r.n) || {}).s || '')} · ${t((SF.STARTUPS.find(s => s.n === r.n) || {}).r || '')}</div></div><span class="chip red">${t(r.round)}</span></div>
    <div class="small">${esc(r.metric)}</div><div class="muted small">${esc(r.terms)} · ${t('closes {d}', { d: r.close })}${r.lead ? ' · ' + t('lead: {l}', { l: r.lead }) : ''}</div>${bar(r.n)}
    <div class="row between">${st ? `<span class="chip ${st === 'Invested' ? 'ok' : ''}">${t(st)}</span>` : '<span></span>'}<div class="row" style="gap:6px"><button class="btn ghost sm" data-act="watch" data-n="${esc(r.n)}" aria-pressed="${watching}">${watching ? '★ ' + t('Watching') : '☆ ' + t('Watch')}</button>${act}</div></div></div>`; };
const introRow = x => `<tr><td><b>${esc(x.startup)}</b></td><td>${esc(x.date)}</td><td><span class="chip ${x.status === 'Invested' ? 'ok' : x.status === 'Passed' ? '' : 'warn'}">${t(x.status)}</span></td>
  <td class="row" style="gap:6px;flex-wrap:nowrap">${x.status === 'Requested' ? `<button class="btn ghost sm" data-act="introstep" data-id="${x.id}" data-s="Meeting held">${t('Meeting held')}</button>` : ''}${['Requested', 'Meeting held'].includes(x.status) ? `<button class="btn ghost sm" data-act="introstep" data-id="${x.id}" data-s="Passed">${t('Pass')}</button><button class="btn sm" data-act="loginv" data-n="${esc(x.startup)}" data-intro="${x.id}">${t('Log investment')}</button>` : ''}</td></tr>`;
V.deals = () => { const r = role(), inv = SF.who();
  if (r === 'org') { const queue = Object.entries(S().vip).filter(([, v]) => v.status === 'Submitted'), cap = SF.capital();
    return `${sh(t('Capital'), `<span class="muted">${t('Rounds, verification and investments')}</span>`)}
    <div class="kpis"><div class="kpi red"><b class="num">${SF.usd(cap)}</b><span>${t('invested via Startup Fest (logged)')}</span></div><div class="kpi black"><b class="num">${SF.usd(SF.rounds().reduce((a, x) => a + x.ask, 0))}</b><span>${t('being raised now')}</span></div>
      <div class="kpi"><b class="num">${SF.usd(SF.rounds().reduce((a, x) => a + SF.committed(x.n), 0))}</b><span>${t('soft commitments')}</span></div><div class="kpi"><b class="num">${Object.values(S().vip).filter(v => v.status === 'Verified').length}</b><span>${t('verified investors')}</span></div></div>
    ${sh(t('Verification requests'), `<span class="chip red">${queue.length}</span>`)}
    <div class="card tablewrap"><table><thead><tr><th>${t('Investor')}</th><th>${t('Type')}</th><th>${t('Investments')}</th><th>${t('Checks')}</th><th>${t('Notes')}</th><th></th></tr></thead><tbody>${queue.map(([n, v]) => `<tr><td><b>${esc(n)}</b></td><td>${t(v.kind)}</td><td class="num">${esc(v.deals || '')}</td><td class="num">${(v.checks || []).length}/4</td><td>${esc(v.note || '')}</td>
      <td class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn sm" data-act="vipok" data-n="${esc(n)}">${t('Verify')}</button><button class="btn ghost sm" data-act="vipno" data-n="${esc(n)}">${t('Decline')}</button></td></tr>`).join('') || `<tr><td colspan="6" class="muted">${t('Nothing to review')}</td></tr>`}</tbody></table></div>
    ${sh(t('Open rounds'))}<div class="card tablewrap"><table><thead><tr><th>${t('Startup')}</th><th>${t('Round')}</th><th>${t('Ask')}</th><th>${t('Committed')}</th><th>${t('Access requests')}</th><th>${t('Closes')}</th></tr></thead><tbody>
    ${SF.rounds().map(x => `<tr><td><a class="link" href="#/deal/${encodeURIComponent(x.n)}">${esc(x.n)}</a></td><td>${t(x.round)}</td><td class="num">${SF.usd(x.ask)}</td><td class="num">${SF.usd(SF.committed(x.n))} · ${pct(x.n)}%</td><td class="num">${Object.keys(SF.dealOf(x.n).access).length}</td><td>${esc(x.close)}</td></tr>`).join('')}</tbody></table></div>
    ${sh(t('Investments logged'))}<div class="card tablewrap"><table><thead><tr><th>${t('Investor')}</th><th>${t('Startup')}</th><th>${t('Amount')}</th><th>${t('Instrument')}</th><th>${t('Date')}</th><th>${t('Came from')}</th></tr></thead><tbody>
    ${S().investments.map(x => `<tr><td>${esc(x.by)}</td><td><b>${esc(x.startup)}</b></td><td class="num">${SF.usd(x.amt)}</td><td>${t(x.instr)}</td><td>${esc(x.date)}</td><td>${t(x.via)}</td></tr>`).join('')}</tbody></table></div>`; }
  const mine = S().investments.filter(x => x.by === inv), my = S().intros.filter(x => x.by === inv);
  const counts = SF.INVEST_STAGES.map(s => [s, SF.rounds().filter(x => SF.stageOf(x.n, inv) === s).length]);
  const f = S().filters.dstage || 'All', list = SF.rounds().filter(x => f === 'All' || SF.stageOf(x.n, inv) === f);
  return `${sh(t('Deal flow'), vipChip(inv) || `<a class="btn sm" href="#/verify">${t('Get verified')}</a>`)}
  ${SF.isVip(inv) ? '' : `<div class="card pad row between" style="margin-bottom:16px;border:1.5px solid var(--pink-line)"><div><b>${t('Data rooms are for verified investors')}</b><div class="muted small">${t('You can see who is raising. Get verified to request access.')}</div></div><a class="cta" href="#/verify"><span class="btn">${t('Get verified')}</span>${SF.ARROW}</a></div>`}
  <div class="pipe">${counts.map(([s, n]) => `<button class="pipe-st ${f === s ? 'on' : ''}" data-act="filter" data-k="dstage" data-v="${f === s ? 'All' : s}"><b class="num">${n}</b><span>${t(s)}</span></button>`).join('')}</div>
  <div class="grid g3" style="margin-top:16px">${list.map(x => roundCard(x, inv)).join('') || `<div class="card empty">${t('Nothing in this stage')}</div>`}</div>
  ${sh(t('My intros'), `<span class="muted">${t('Intros you asked Startup Fest for')}</span>`)}
  <div class="card tablewrap"><table><thead><tr><th>${t('Startup')}</th><th>${t('Date')}</th><th>${t('Status')}</th><th></th></tr></thead><tbody>${my.map(introRow).join('') || `<tr><td colspan="4" class="muted">${t('No intros yet. Use “Request intro” on a startup.')}</td></tr>`}</tbody></table></div>
  ${sh(t('My portfolio'), `<button class="btn ghost sm" data-act="loginv">${t('Log investment')}</button>`)}
  <div class="grid g4">${mine.map(x => `<div class="card pad stack" style="gap:4px"><b>${esc(x.startup)}</b><b class="display num" style="font-size:34px;color:var(--brand)">${SF.usd(x.amt)}</b><span class="muted small">${t(x.instr)} · ${esc(x.date)}</span></div>`).join('') || `<div class="card empty">${t('No investments logged yet')}</div>`}</div>`;
};

/* ---------- Deal room ---------- */
const docTxt = (n, doc) => `${n} — ${doc}\n\n` + ({ 'Pitch deck': 'Problem · Solution · Traction · Market · Team · The ask', 'Financial model': 'Month, revenue, costs, cash (18 months)', 'Cap table': 'Founders 85% · ESOP 10% · Angels 5%', 'Company registration': 'LLC registered with the Public Services Agency', 'Traction metrics': 'Monthly users, revenue and retention for the last 3 months' }[doc] || '') + '\n\nDemo document. Startup Fest deal room.';
SF.docTxt = docTxt;
V.deal = p => { const n = decodeURIComponent(p || ''), r = SF.round(n); if (!r) return V.deals();
  const d = SF.dealOf(n), inv = SF.who(), org = role() === 'org', owner = role() === 'participant' && SF.myTeam() === n;
  if (owner) return V.raise();
  const access = org || (SF.isVip(inv) && d.access[inv] === 'granted' && d.nda.includes(inv));
  const head = `${SF.back('#/deals', t('Deal flow'))}<section class="panel red deal-hero"><div class="row between" style="align-items:flex-start"><div><span class="chip" style="background:#fff;color:var(--brand)">${t(r.round)}</span>
    <h1 class="display" style="font-size:clamp(44px,6vw,84px);margin-top:10px">${esc(n)}</h1><p style="margin:0;font-size:18px;font-weight:300">${esc(r.metric)}</p></div>
    <div class="deal-ask"><b class="display num">${SF.usd(r.ask)}</b><span>${esc(r.terms)}</span><span>${t('closes {d}', { d: r.close })}</span></div></div>
    <div style="margin-top:18px;max-width:560px">${bar(n)}</div></section>`;
  if (!access) { const st = d.access[inv];
    return `${head}<div class="card pad stack" style="margin-top:16px;max-width:720px">${!SF.isVip(inv) ? `<b>${t('Data rooms are for verified investors')}</b><a class="btn" style="align-self:start" href="#/verify">${t('Get verified')}</a>`
      : st === 'granted' ? `<b>${t('Non-disclosure agreement')}</b><p class="muted" style="margin:0">${t('{n} shares its documents on the condition that you keep them private and do not share them with competitors. The agreement lasts 2 years.', { n: esc(n) })}</p>
        <form id="nda-form" data-n="${esc(n)}" class="stack"><label class="chk wide req"><input type="checkbox" id="nda-ok"><span>${t('I agree to the NDA on behalf of {w}', { w: esc(inv) })}</span></label><button class="btn" style="align-self:start">${t('Sign and open the deal room')}</button></form>`
      : st === 'requested' ? `<span class="chip warn" style="align-self:start">${t('Waiting for the founder')}</span><span class="muted">${t('The founder approves each investor. Most reply within 2 days.')}</span>`
      : `<b>${t('Ask the founder for access')}</b><button class="btn" style="align-self:start" data-act="dealreq" data-n="${esc(n)}">${t('Request access')}</button>`}</div>`; }
  const myC = d.commits.find(c => c.by === inv);
  return `${head}<div class="detail" style="margin-top:16px"><div class="stack">
    <div class="card pad stack"><b>${t('Documents')}</b><div class="list">${SF.DOCS.map(doc => d.docs.includes(doc) ? `<div class="it"><span class="doc-ic">PDF</span><div class="grow">${t(doc)}</div><button class="btn ghost sm" data-act="dldoc" data-n="${esc(n)}" data-doc="${esc(doc)}">${t('Download')}</button></div>`
      : `<div class="it muted"><span class="doc-ic off">—</span><div class="grow">${t(doc)}</div><span class="small">${t('Not shared yet')}</span></div>`).join('')}</div></div>
    <div class="card pad stack"><b>${t('Questions and answers')}</b><div class="list">${d.qa.map(q => `<div class="it" style="align-items:flex-start"><span class="mini" style="background:${R('investor').color}">${SF.initials(q.by)}</span><div class="grow"><div class="t">${esc(q.q)}</div><div class="s">${esc(q.by)}</div>${q.a ? `<div class="answer">${esc(q.a)}</div>` : `<div class="muted small">${t('Waiting for the founder’s answer')}</div>`}</div></div>`).join('') || `<span class="muted">${t('No questions yet.')}</span>`}</div>
      ${org ? '' : `<form id="qa-form" data-n="${esc(n)}" class="row" style="align-items:flex-end"><div class="field grow"><label for="qa-q">${t('Ask the founder')}</label><input id="qa-q" required></div><button class="btn">${t('Ask')}</button></form>`}</div>
  </div><div class="stack">
    ${org ? `<div class="card pad stack"><b>${t('Who has access')}</b><div class="list">${Object.entries(d.access).map(([w, s]) => `<div class="it"><div class="grow">${esc(w)}</div><span class="chip">${t({ granted: 'Granted', requested: 'Requested', denied: 'Declined' }[s])}</span></div>`).join('') || `<span class="muted">—</span>`}</div></div>`
    : `<div class="card pad stack"><b>${myC ? t('Your commitment') : t('Commit to this round')}</b>${myC ? `<b class="display num" style="font-size:40px;color:var(--brand)">${SF.usd(myC.amt)}</b><span class="muted small">${t('Soft commitment. It becomes final when you sign the documents.')}</span>
      <button class="btn" style="align-self:start" data-act="loginv" data-n="${esc(n)}" data-amt="${myC.amt}">${t('Log the investment')}</button>`
      : `<form id="commit-form" data-n="${esc(n)}" class="stack"><div class="field"><label for="cm-a">${t('Amount (USD)')}</label><input id="cm-a" inputmode="numeric" required placeholder="25 000"></div><span class="muted small">${t('A soft commitment helps the founder find a lead. You can change it until the round closes.')}</span><button class="btn" style="align-self:start">${t('Commit')}</button></form>`}</div>`}
    <div class="card pad stack"><b>${t('Commitments')}</b><div class="list">${d.commits.map(c => `<div class="it"><div class="grow">${esc(c.by)}</div><b class="num">${SF.usd(c.amt)}</b></div>`).join('') || `<span class="muted">${t('No commitments yet')}</span>`}</div></div>
  </div></div>`;
};

/* ---------- Founder fundraising ---------- */
V.raise = () => { const team = SF.myTeam(), r = SF.round(team);
  if (!r) return `${sh(t('Fundraising'))}<form id="round-form" class="card pad stack" style="max-width:720px"><b>${t('Open a round on Startup Fest')}</b><span class="muted">${t('Verified investors will see it in their deal flow. You approve who opens your data room.')}</span>
    <div class="two"><div class="field"><label for="rd-r">${t('Round')}</label><select id="rd-r">${['Pre-seed', 'Seed', 'Grant'].map(x => `<option value="${x}">${t(x)}</option>`).join('')}</select></div><div class="field"><label for="rd-a">${t('Amount (USD)')}</label><input id="rd-a" required inputmode="numeric" placeholder="100 000"></div></div>
    <div class="two"><div class="field"><label for="rd-t">${t('Terms')}</label><input id="rd-t" required placeholder="SAFE · $1M cap"></div><div class="field"><label for="rd-c">${t('Closes')}</label><input id="rd-c" required placeholder="31 Jan"></div></div>
    <div class="field"><label for="rd-m">${t('Your best number')}</label><input id="rd-m" required placeholder="${t('e.g. 40 paying customers')}"></div><button class="btn" style="align-self:start">${t('Open the round')}</button></form>`;
  const d = SF.dealOf(team), ready = S().ready[team] = S().ready[team] || [], rp = Math.round(ready.length / SF.READY.length * 100);
  const reqs = Object.entries(d.access).filter(([, s]) => s === 'requested'), open = d.qa.filter(q => !q.a);
  return `${sh(t('Fundraising'), `<a class="btn ghost sm" href="#/hours">${t('Book a fundraising mentor')}</a>`)}
  <section class="panel red deal-hero"><div class="row between" style="align-items:flex-start"><div><span class="chip" style="background:#fff;color:var(--brand)">${t(r.round)}</span><h1 class="display" style="font-size:clamp(44px,6vw,80px);margin-top:10px">${esc(team)}</h1><p style="margin:0;font-size:18px;font-weight:300">${esc(r.terms)} · ${t('closes {d}', { d: r.close })}</p></div>
    <div class="deal-ask"><b class="display num">${pct(team)}%</b><span>${t('committed')}</span></div></div><div style="margin-top:18px;max-width:560px">${bar(team)}</div></section>
  <div class="grid g2" style="margin-top:16px;align-items:start"><div class="stack">
    <div class="card pad stack"><div class="row between"><b>${t('Investor readiness')}</b><span class="chip ${rp >= 70 ? 'ok' : 'warn'}">${rp}%</span></div><div class="bar"><i style="width:${rp}%"></i></div>
      <div class="list">${SF.READY.map(([k, x]) => `<label class="it check"><input type="checkbox" data-act="readyitem" data-k="${k}" ${ready.includes(k) ? 'checked' : ''}><div class="grow">${t(x)}</div></label>`).join('')}</div></div>
    <div class="card pad stack"><b>${t('Documents in the data room')}</b><div class="list">${SF.DOCS.map(doc => `<div class="it"><span class="doc-ic ${d.docs.includes(doc) ? '' : 'off'}">${d.docs.includes(doc) ? 'PDF' : '—'}</span><div class="grow">${t(doc)}</div>${d.docs.includes(doc) ? `<span class="chip ok">${t('Shared')}</span>` : `<button class="btn ghost sm" data-act="updoc" data-doc="${esc(doc)}">${t('Upload')}</button>`}</div>`).join('')}</div></div>
  </div><div class="stack">
    <div class="card pad stack"><div class="row between"><b>${t('Access requests')}</b><span class="chip red">${reqs.length}</span></div><div class="list">${reqs.map(([w]) => `<div class="it"><span class="mini" style="background:${R('investor').color}">${SF.initials(w)}</span><div class="grow"><div class="t">${esc(w)}</div><div class="s">${SF.isVip(w) ? '✓ ' + t('Verified investor') : ''}</div></div><button class="btn sm" data-act="dealgrant" data-w="${esc(w)}">${t('Approve')}</button><button class="btn ghost sm" data-act="dealdeny" data-w="${esc(w)}">${t('Decline')}</button></div>`).join('') || `<span class="muted">${t('No new requests')}</span>`}</div></div>
    <div class="card pad stack"><b>${t('Questions from investors')}</b>${open.map(q => `<form class="stack answer-form" id="ans-form-${q.id}" data-q="${q.id}"><div><b>${esc(q.q)}</b><div class="muted small">${esc(q.by)}</div></div><div class="row" style="align-items:flex-end"><div class="field grow"><label class="sr" for="an-${q.id}">${t('Your answer')}</label><input id="an-${q.id}" required placeholder="${t('Your answer')}"></div><button class="btn">${t('Answer')}</button></div></form>`).join('') || `<span class="muted">${t('All questions answered')}</span>`}</div>
    <div class="card pad stack"><b>${t('Commitments')}</b><div class="list">${d.commits.map(c => `<div class="it"><div class="grow">${esc(c.by)}</div><b class="num">${SF.usd(c.amt)}</b></div>`).join('') || `<span class="muted">${t('No commitments yet')}</span>`}</div></div>
  </div></div>`;
};

/* ---------- VC Battle ---------- */
SF.bRound = () => SF.BATTLE.rounds[S().battle.round];
SF.bStartups = i => { const rd = SF.BATTLE.rounds[i]; if (rd[2]) return rd[2];
  const all = [0, 1, 2].flatMap(j => SF.BATTLE.rounds[j][2].map(n => [n, SF.bScore(j, n)])); return all.sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]); };
SF.bScore = (i, n) => { const B = S().battle, picks = B.picks[i] || {}, votes = B.votes[i] || {}, names = SF.bStartups(i);
  const tot = names.reduce((a, x) => a + Object.values(picks).reduce((b, p) => b + (+p[x] || 0), 0), 0), mine = Object.values(picks).reduce((b, p) => b + (+p[n] || 0), 0);
  const vt = names.reduce((a, x) => a + (votes[x] || 0), 0);
  return Math.round(50 * (tot ? mine / tot : 0) + 50 * (vt ? (votes[n] || 0) / vt : 0)); };
SF.myBTeam = () => SF.BATTLE.teams.find(x => x.members.includes(SF.who()));
V.battle = () => { const B = S().battle, i = B.round, rd = SF.BATTLE.rounds[i], names = SF.bStartups(i), r = role(), team = SF.myBTeam(), org = r === 'org';
  const spent = team ? Object.entries(B.picks).reduce((a, [, p]) => a + Object.values(p[team.n] || {}).reduce((b, x) => b + (+x || 0), 0), 0) : 0;
  const myPick = team && (B.picks[i] || {})[team.n];
  const votes = B.votes[i] || {}, vt = names.reduce((a, x) => a + (votes[x] || 0), 0);
  return `<section class="panel black battle-hero"><div class="vip-star" aria-hidden="true">${SF.STAR(300, '#e01a09')}</div><div class="row between"><span class="chip live">● ${B.done ? t('Final') : B.open ? t('Voting open') : t('Live')}</span><span class="muted" style="color:#bbb">12 Dec · ${t('Zakovat Arena, Tashkent')}</span></div>
    <h1 class="display" style="font-size:clamp(52px,7vw,104px);margin-top:10px">VC BATTLE</h1><p style="font-size:18px;font-weight:300;max-width:52ch;margin:0">${t('Investor teams back startups with a $1M virtual budget. The audience votes live. Half the score comes from each.')}</p>
    <div class="b-rounds">${SF.BATTLE.rounds.map((x, j) => `<span class="${j === i ? 'on' : j < i ? 'past' : ''}">${t(x[0])}</span>`).join('')}</div></section>
  ${B.done ? `<div class="card pad row winner" style="margin-top:16px">${SF.STAR(48)}<div class="grow"><div class="eyebrow">${t('Winner')}</div><b class="display" style="font-size:44px">${esc(B.winner)}</b></div><a class="btn ghost" href="#/deal/${encodeURIComponent(B.winner)}">${t('See the round')}</a></div>` : ''}
  ${sh(`${t(rd[0])} · ${t(rd[1])}`, `<span class="muted">${t('{n} votes so far', { n: vt })}</span>`)}
  <div class="grid g${Math.min(3, names.length)}">${names.map(n => { const s = SF.STARTUPS.find(x => x.n === n) || {}, sc = SF.bScore(i, n), mineV = B.voted[i] === n;
    return `<div class="card pad stack b-card"><div class="row between"><div><b style="font-size:20px">${esc(n)}</b><div class="muted small">${esc(t(s.t || ''))}</div></div><b class="display num" style="font-size:44px;color:var(--brand)">${sc}</b></div>
      <div class="small muted">${t('Audience')}: <b class="num">${votes[n] || 0}</b> · ${t('Investors')}: <b class="num">${SF.usd(Object.values(B.picks[i] || {}).reduce((a, p) => a + (+p[n] || 0), 0))}</b></div><div class="bar thick"><i style="width:${sc}%"></i></div>
      ${!org && !team && B.open && !B.done ? (B.voted[i] ? (mineV ? `<span class="chip ok" style="align-self:start">✓ ${t('Your vote')}</span>` : '') : `<button class="btn sm" style="align-self:start" data-act="bvote" data-n="${esc(n)}">${t('Vote')}</button>`) : ''}</div>`; }).join('')}</div>
  ${team && !B.done ? `<form id="bpick-form" class="card pad stack" style="margin-top:16px"><div class="row between"><b>${t('Team {t}: your picks', { t: esc(team.n) })}</b><span class="muted small">${t('{a} of {b} left', { a: SF.usd(SF.BATTLE.budget - spent + (myPick ? Object.values(myPick).reduce((a, x) => a + (+x || 0), 0) : 0)), b: SF.usd(SF.BATTLE.budget) })}</span></div>
    <div class="grid g${Math.min(3, names.length)}">${names.map(n => `<div class="field"><label for="bp-${SF.slug(n)}">${esc(n)} (USD)</label><input id="bp-${SF.slug(n)}" data-n="${esc(n)}" inputmode="numeric" value="${myPick && myPick[n] ? myPick[n] : ''}" placeholder="0"></div>`).join('')}</div>
    <button class="btn" style="align-self:start" ${B.open ? '' : 'disabled'}>${B.open ? t('Save our picks') : t('Picks open with voting')}</button></form>` : ''}
  ${org ? `<div class="card pad stack" style="margin-top:16px"><b>${t('Stage control')}</b><div class="row">
    ${B.done ? `<span class="chip ok">${t('Battle finished')}</span>` : `${B.open ? `<button class="btn" data-act="bclose">${t('Close voting')}</button>` : `<button class="btn" data-act="bopen">${t('Open voting')}</button>`}
    <button class="btn ghost" data-act="bsim">${t('Simulate the hall')}</button>${i < 3 ? `<button class="btn ghost" data-act="bnext" ${B.open ? 'disabled' : ''}>${t('Next round')}</button>` : `<button class="btn dark" data-act="bfinish" ${B.open ? 'disabled' : ''}>${t('Announce the winner')}</button>`}`}</div>
    <span class="muted small">${t('“Simulate the hall” adds audience votes and the other investor teams’ picks, as if the event were live.')}</span></div>` : ''}
  ${i > 0 || B.done ? `${sh(t('Results so far'))}<div class="card tablewrap"><table><thead><tr><th>${t('Round')}</th><th>${t('Startup')}</th><th>${t('Score')}</th></tr></thead><tbody>${SF.BATTLE.rounds.slice(0, B.done ? 4 : i).map((x, j) => SF.bStartups(j).map(n => `<tr><td>${t(x[0])}</td><td><b>${esc(n)}</b></td><td class="num">${SF.bScore(j, n)}</td></tr>`).join('')).join('')}</tbody></table></div>` : ''}`;
};

/* ---------- startup profile: show the round ---------- */
const st6 = V.startup;
V.startup = n => { const h = st6(n), r = SF.round(decodeURIComponent(n || '')); if (!r) return h; const nm = r.n, inv = ['investor', 'scout'].includes(role());
  const box = `<div class="card pad stack" style="margin-top:16px;border:1.5px solid var(--pink-line)"><div class="row between"><b>${t('Raising: {r}', { r: t(r.round) })}</b><span class="chip red">${SF.usd(r.ask)}</span></div>${bar(nm)}<span class="muted small">${esc(r.terms)} · ${t('closes {d}', { d: r.close })}</span>
    ${inv ? `<a class="btn sm" style="align-self:start" href="#/deal/${encodeURIComponent(nm)}">${t('Open deal room')}</a>` : ''}</div>`;
  return h + box; };

/* ---------- home strips, My ID, dashboard ---------- */
const home6 = V.home;
V.home = () => { let h = home6(); const r = role();
  if (r === 'investor') { const inv = SF.who(), req = SF.rounds().filter(x => SF.dealOf(x.n).access[inv] === 'requested').length;
    const strip = `<div class="foryou">${[['#/deals', t('{n} rounds open', { n: SF.rounds().length }), SF.isVip(inv) ? t('You are verified') : t('Get verified to open data rooms')], ['#/battle', 'VC Battle · 12 Dec', SF.myBTeam() ? t('Team {t}', { t: SF.myBTeam().n }) : t('Vote live')], ['#/deals', t('{n} waiting for founders', { n: req }), t('Access requests')]].map(([a, b, c], i) => `<a class="fy ${i === 0 ? 'red' : ''}" href="${a}"><b>${b}</b><span>${c}</span>${SF.ARROW}</a>`).join('')}</div>`;
    const i = h.indexOf('<div class="kpis">'); h = i >= 0 ? h.slice(0, i) + strip + h.slice(i) : strip + h; }
  if (r === 'participant' && SF.round(SF.myTeam())) { const n = SF.myTeam(), add = `<a class="fy" href="#/raise"><b>${t('Fundraising: {p}% committed', { p: pct(n) })}</b><span>${t('{n} access requests', { n: Object.values(SF.dealOf(n).access).filter(s => s === 'requested').length })}</span>${SF.ARROW}</a>`;
    h = h.replace('<div class="foryou">', '<div class="foryou four">' + add); }
  return h; };
const me6 = V.me;
V.me = () => { let h = me6(); if (role() === 'investor' && SF.isVip()) h = h.replace('<div class="qr"', `<span class="chip vip">✓ ${t('Verified investor')}</span><div class="qr"`);
  if (role() === 'participant' && SF.round(SF.myTeam())) h = h.replace(`<a class="btn ghost" href="#/fellows">`, `<a class="btn ghost" href="#/raise">${t('Fundraising')}</a><a class="btn ghost" href="#/fellows">`);
  return h; };
const adm6 = V.admin;
V.admin = () => { const h = adm6(), q = Object.values(S().vip).filter(v => v.status === 'Submitted').length;
  const block = `<a class="card pad tile" href="#/deals"><b style="font-size:20px">${t('Capital')}</b><span class="muted">${t('{v} invested · {n} to verify', { v: SF.usd(SF.capital()), n: q })}</span></a><a class="card pad tile" href="#/battle"><b style="font-size:20px">VC Battle</b><span class="muted">${S().battle.done ? t('Winner: {w}', { w: S().battle.winner }) : t('{r} · 12 Dec', { r: t(SF.bRound()[0]) })}</span></a>`;
  return h.replace(`<div class="grid g4"><a class="card pad tile" href="#/hours">`, `<div class="grid g3">${block}<a class="card pad tile" href="#/hours">`); };
})();
