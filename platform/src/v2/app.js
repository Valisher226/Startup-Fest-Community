// Router, navigation and all user actions
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc;
const NAV = {
  participant: ['home', 'events', 'catalyst', 'earn', 'messages', 'community', 'me'],
  mentor: ['home', 'events', 'directory', 'messages', 'community', 'me'],
  investor: ['home', 'directory', 'events', 'messages', 'community', 'me'],
  company: ['home', 'catalyst', 'earn', 'directory', 'messages', 'community', 'me'],
  org: ['admin', 'events', 'catalyst', 'directory', 'community', 'messages', 'me'],
};
SF.NAV = NAV;
const LABEL = { home: 'Home', events: 'Events', catalyst: 'Catalyst', earn: 'Startup Earn', directory: 'Startups', messages: 'Messages', community: 'Community', me: 'My ID', admin: 'Dashboard', season: 'Season' };
const TAB_OF = { pilot: 'catalyst', roadmap: null, startup: 'directory', council: 'community' };
const route = () => { const [, v = '', p = ''] = (location.hash || '').split('/'); return { v: v || NAV[SF.S.role][0], p }; };

SF.render = () => {
  const S = SF.S, { v, p } = route();
  const allowed = NAV[S.role].includes(v) || v in TAB_OF;
  const view = allowed && SF.V[v] ? v : NAV[S.role][0];
  document.documentElement.lang = SF.lang;
  document.getElementById('role').value = S.role;
  const tab = TAB_OF[view] !== undefined ? TAB_OF[view] : view;
  const unread = S.threads.filter(x => x.unread).length;
  document.getElementById('tabs').innerHTML = NAV[S.role].map(k => `<a class="tab" href="#/${k}" ${tab === k ? 'aria-current="page"' : ''}>${SF.icon(k)}<span>${t(LABEL[k])}</span>${k === 'messages' && unread ? `<span class="badge">${unread}</span>` : ''}</a>`).join('');
  const n = S.notifs.filter(x => x.role === S.role && !x.read).length;
  document.getElementById('bellcount').textContent = n || ''; document.getElementById('bellcount').hidden = !n;
  document.getElementById('view').innerHTML = SF.V[view](p);
  document.querySelectorAll('[data-qr]').forEach(q => { if (window.QRCode) new QRCode(q, { text: 'STARTUPFEST:' + q.dataset.qr, width: 220, height: 220, colorDark: '#1C1514', colorLight: '#ffffff' }); });
  const sc = document.getElementById('scroll'); if (sc) sc.scrollTop = sc.scrollHeight;
  SF.renderChrome && SF.renderChrome();
  SF.save();
};
window.addEventListener('hashchange', () => { SF.render(); window.scrollTo({ top: 0 }); });

/* ---------- modals ---------- */
const fieldHtml = (f, val) => f.type === 'select'
  ? `<div class="field"><label for="jf-${f.k}">${t(f.label)}</label><select id="jf-${f.k}" name="${f.k}">${f.options.map(o => `<option value="${esc(o)}" ${o === val ? 'selected' : ''}>${t(o)}</option>`).join('')}</select></div>`
  : `<div class="field"><label for="jf-${f.k}">${t(f.label)}</label><input id="jf-${f.k}" name="${f.k}" placeholder="${t(f.ph || '')}" value="${esc(val || '')}"></div>`;
const joinModal = (r = SF.S.role === 'org' ? 'participant' : SF.S.role) => SF.modal(`<h3>${t('Get your Startup Fest ID')}</h3><p class="muted" style="margin:0">${t('One ID for every event, application and gig.')}</p>
  <form id="join-form" class="stack"><div class="field"><label for="j-role">${t('I am a')}</label><select id="j-role">${Object.keys(SF.ROLE_FIELDS).map(k => `<option value="${k}" ${k === r ? 'selected' : ''}>${t(SF.ROLES[k].label)}</option>`).join('')}</select></div>
  <div class="field"><label for="j-name">${t('Full name')}</label><input id="j-name" required placeholder="${t('e.g. Sardor Aliyev')}"></div>
  <div class="field"><label for="j-reg">${t('Region')}</label><select id="j-reg">${SF.REGIONS.map(x => `<option value="${x}">${t(x)}</option>`).join('')}</select></div>
  <div id="role-fields" class="stack">${SF.ROLE_FIELDS[r].map(f => fieldHtml(f)).join('')}</div>
  <label class="row small" style="gap:8px"><input type="checkbox" id="j-ok" checked> ${t('Startup Fest may recommend my profile to partners')}</label>
  <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Create my ID')}</button></div></form>`);
const applyModal = id => { const b = SF.BRIEFS.find(x => x.id === id), me = SF.me('participant');
  SF.modal(`<h3>${t('Apply to {c}', { c: esc(b.co) })}</h3><p style="margin:0;font-weight:600">${t(b.problem)}</p>
  <form id="apply-form" data-b="${id}" class="stack"><div class="field"><label for="a-st">${t('Startup')}</label><input id="a-st" required value="${esc(me.fields.team || '')}"></div>
  <div class="field"><label for="a-sol">${t('Your solution in two lines')}</label><textarea id="a-sol" required>${t('Drone photos and a phone app that flag water stress per field, so irrigation runs only where needed.')}</textarea></div>
  <div class="field"><label for="a-team">${t('Team size')}</label><select id="a-team"><option>1</option><option>2</option><option selected>3</option><option>4+</option></select></div>
  <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Send application')}</button></div></form>`); };
const decideModal = (pid, ok) => { const p = SF.S.pipeline.find(x => x.id === pid);
  SF.modal(`<h3>${ok ? t('Accept {s}', { s: esc(p.startup) }) : t('Decline {s}', { s: esc(p.startup) })}</h3>
  <form id="decide-form" data-p="${pid}" data-ok="${ok ? 1 : 0}" class="stack"><div class="field"><label for="d-note">${t('Note to the team (they will see it)')}</label>
  <textarea id="d-note">${ok ? t('Strong fit. Come to the Catalyst day with a 5-minute demo.') : t('Good idea, but we need a working sensor prototype. Apply to the next brief.')}</textarea></div>
  <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${ok ? t('Accept') : t('Decline')}</button></div></form>`); };
const gigModal = () => SF.modal(`<h3>${t('Post a gig')}</h3><form id="gig-form" class="stack"><div class="field"><label for="p-title">${t('What do you need?')}</label><input id="p-title" required placeholder="${t('e.g. Instagram ads for our shop')}"></div>
  <div class="field"><label for="p-type">${t('Type')}</label><select id="p-type"><option value="Gig">${t('Gig')}</option><option value="Job">${t('Job')}</option></select></div>
  <div class="field"><label for="p-pay">${t('Pay (UZS)')}</label><input id="p-pay" placeholder="${t('e.g. 1.5M UZS')}"></div>
  <div class="field"><label for="p-reg">${t('Region')}</label><select id="p-reg">${SF.REGIONS.map(x => `<option value="${x}">${t(x)}</option>`).join('')}</select></div>
  <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Publish gig')}</button></div></form>`);
const briefModal = () => SF.modal(`<h3>${t('Post a Catalyst brief')}</h3><p class="muted" style="margin:0">${t('Briefs need a named owner and a pilot budget before they go live.')}</p>
  <form id="brief-form" class="stack"><div class="field"><label for="br-p">${t('Problem')}</label><textarea id="br-p" required placeholder="${t('What hurts, and how you measure it today')}"></textarea></div>
  <div class="field"><label for="br-o">${t('Owner (role)')}</label><input id="br-o" required placeholder="${t('e.g. Head of Logistics')}"></div>
  <div class="field"><label for="br-b">${t('Pilot budget')}</label><input id="br-b" required placeholder="${t('e.g. 40M UZS')}"></div>
  <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Submit for review')}</button></div></form>`);
const resetModal = () => SF.modal(`<h3>${t('Reset the demo?')}</h3><p style="margin:0">${t('All your registrations, applications, gigs and messages in this browser will be cleared.')}</p>
  <div class="row end"><button class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn" data-act="doreset">${t('Reset demo')}</button></div>`);

/* ---------- notifications panel ---------- */
const bellPanel = () => { const list = SF.S.notifs.filter(n => n.role === SF.S.role).slice(0, 12);
  const el = document.getElementById('bellpanel'); el.hidden = !el.hidden; if (el.hidden) return;
  el.innerHTML = `<div class="row between" style="padding:10px 14px;border-bottom:1px solid var(--line)"><b>${t('Notifications')}</b><button class="linkbtn" data-act="readall">${t('Mark all read')}</button></div>
  ${list.map(n => `<a class="note ${n.read ? '' : 'unread'}" href="${n.go || '#/home'}" data-act="readone" data-id="${n.id}">${esc(n.t)}</a>`).join('') || `<div class="empty">${t('Nothing new')}</div>`}`; };
document.addEventListener('click', e => { const p = document.getElementById('bellpanel'); if (!p.hidden && !e.target.closest('#bellpanel,#bell')) p.hidden = true; });

/* ---------- actions ---------- */
const pid = id => SF.S.pipeline.find(x => x.id === id);
const roleOfId = id => Object.keys(SF.S.people).find(r => SF.S.people[r].id === id);
function checkIn(ev, id) {
  const S = SF.S, list = S.checkins[ev] = S.checkins[ev] || [], e = SF.EVENTS.find(x => x.id === ev);
  if (list.includes(id)) return SF.toast(t('{id} is already checked in', { id }));
  const known = SF.ATTENDEES.find(a => a.id === id) || roleOfId(id);
  if (!known) return SF.toast(t('No member with ID {id}', { id }));
  list.push(id);
  const r = roleOfId(id);
  if (r) { SF.award(r, 'checkin', t('Checked in at {e}', { e: t(e.title) })); SF.notify(r, t('You checked in at {e} · +{p} points', { e: t(e.title), p: SF.RULES.checkin }), '#/me'); }
  SF.toast(t('Checked in · +{p} points to the member', { p: SF.RULES.checkin })); SF.render();
}
const A = {
  upvote: d => { const i = +d.i; SF.S.launches[i]++; SF.S.upvoted.push(i); SF.award(SF.S.role, 'upvote', t('Upvoted {n}', { n: SF.LAUNCHES[i].n })); SF.render(); },
  reg: d => { const e = SF.EVENTS.find(x => x.id === d.ev); (SF.S.reg[SF.S.role] = SF.S.reg[SF.S.role] || []).push(d.ev); SF.award(SF.S.role, 'register', t('Registered for {e}', { e: t(e.title) })); SF.toast(t('Registered. Show your QR at the door.')); SF.render(); },
  unreg: d => { SF.S.reg[SF.S.role] = SF.S.reg[SF.S.role].filter(x => x !== d.ev); SF.toast(t('Registration cancelled')); SF.render(); },
  checkin: d => checkIn(d.ev, d.id),
  apply: d => applyModal(d.b),
  decide: d => decideModal(d.p, d.ok === '1'),
  advance: d => { const p = pid(d.p); if (p.stage < 3) { p.stage++; if (p.stage === 3) p.day = 1; if (p.mine) SF.notify('participant', t('{s} moved to {st}', { s: p.startup, st: t(SF.STAGES[p.stage]) }), '#/catalyst'); SF.toast(t('{s} → {st}', { s: p.startup, st: t(SF.STAGES[p.stage]) })); } SF.render(); },
  week: d => { const p = pid(d.p); p.day = Math.min(100, p.day + 7); if (p.day === 100) SF.toast(t('Day 100 reached. Record the result.')); SF.render(); },
  milestone: (d, el) => { const p = pid(d.p), i = +d.i; if (el.checked) { p.done.push(i); SF.award(SF.S.role, 'milestone', t('Milestone done: {m}', { m: t(SF.MILESTONES[i]) })); } else p.done = p.done.filter(x => x !== i); SF.render(); },
  filter: d => { SF.S.filters[d.k] = d.v; SF.render(); },
  newgig: () => gigModal(), newbrief: () => briefModal(),
  take: d => { SF.S.applied.push(d.g); SF.award(SF.S.role, 'gig', t('Applied for a gig')); SF.toast(t('Sent. The poster will message you.')); SF.render(); },
  pick: d => { const s = SF.S.shortlist; SF.S.shortlist = s.includes(d.n) ? s.filter(x => x !== d.n) : [...s, d.n]; SF.render(); },
  shortlist: () => { SF.notify('org', t('{w} asked for a shortlist: {l}', { w: SF.me().name, l: SF.S.shortlist.join(', ') }), '#/directory'); SF.S.shortlist = []; SF.toast(t('Shortlist request sent to the Startup Fest team')); SF.render(); },
  intro: d => { const id = 't' + Date.now(); SF.S.threads.unshift({ id, who: d.n + ' team', role: 'participant', msgs: [{ me: 1, t: SF.S.role === 'mentor' ? t('Hi! I can offer office hours this week. When suits you?') : t('Hi! I found you on Startup Fest and would like an intro.') }] });
    SF.S.cur = id; SF.award(SF.S.role, 'intro', t('Asked {n} for an intro', { n: d.n })); SF.toast(t('Intro request sent')); SF.go('#/messages'); },
  thread: d => { SF.S.cur = d.th; const th = SF.S.threads.find(x => x.id === d.th); th.unread = false; SF.render(); },
  join: () => joinModal(),
  bell: () => bellPanel(),
  readall: () => { SF.S.notifs.forEach(n => { if (n.role === SF.S.role) n.read = true; }); document.getElementById('bellpanel').hidden = true; SF.render(); },
  readone: d => { const n = SF.S.notifs.find(x => x.id === d.id); if (n) n.read = true; document.getElementById('bellpanel').hidden = true; setTimeout(SF.render, 0); },
  reset: () => resetModal(),
  doreset: () => { SF.reset(); SF.closeModal(); location.hash = '#/home'; SF.render(); SF.toast(t('Demo reset')); },
  export: () => { SF.exportScenario(); SF.toast(t('Scenario file saved')); },
  import: () => document.getElementById('importfile').click(),
};
SF.A = A;
document.addEventListener('click', e => {
  const c = e.target.closest('[data-close]'); if (c && (e.target === c || c.tagName === 'BUTTON')) { SF.closeModal(); return; }
  const el = e.target.closest('[data-act]'); if (!el || el.tagName === 'INPUT') return;
  const fn = A[el.dataset.act]; if (fn) { if (el.tagName === 'BUTTON') e.preventDefault(); fn(el.dataset, el); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.act === 'milestone') return A.milestone(el.dataset, el);
  if (el.dataset.filter) { SF.S.filters[el.dataset.filter] = el.value; SF.render(); }
  if (el.id === 'role') { SF.S.role = el.value; location.hash = '#/' + NAV[SF.S.role][0]; SF.render(); SF.toast(t('Now viewing as {r}', { r: t(SF.ROLES[SF.S.role].label) })); }
  if (el.id === 'j-role') document.getElementById('role-fields').innerHTML = SF.ROLE_FIELDS[el.value].map(f => fieldHtml(f)).join('');
  if (el.id === 'importfile' && el.files[0]) SF.importScenario(el.files[0]).then(() => { SF.render(); SF.toast(t('Scenario loaded')); }).catch(() => SF.toast(t('That file is not a demo scenario')));
  if (el.id === 'lang') { SF.S.lang = SF.lang = el.value; SF.render(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { SF.closeModal(); document.getElementById('bellpanel').hidden = true; } });
document.addEventListener('submit', e => {
  e.preventDefault(); const f = e.target, S = SF.S, val = id => (f.querySelector('#' + id)?.value || '').trim();
  if (f.id === 'compose') { const v = val('msg'); if (!v) return; const th = S.threads.find(x => x.id === S.cur); th.msgs.push({ me: 1, t: v }); SF.render(); document.getElementById('msg').focus();
    setTimeout(() => { th.msgs.push({ me: 0, t: 'Thanks! Let’s talk on Thursday.' }); if (route().v === 'messages') SF.render(); }, 1200); return; }
  if (f.id === 'checkin-form') { const id = val('ci-id').toUpperCase(); if (!/^SF-\d{2}-\d{5}$/.test(id)) return SF.toast(t('IDs look like SF-27-00317')); return checkIn(f.dataset.ev, id); }
  if (f.id === 'join-form') { const r = val('j-role'), fields = {}; SF.ROLE_FIELDS[r].forEach(x => fields[x.k] = val('jf-' + x.k));
    S.people[r] = { name: val('j-name') || t('New member'), region: val('j-reg'), fields, id: 'SF-27-' + String(Math.floor(10000 + Math.random() * 89999)), points: 0, counts: { checkin: 0, apply: 0, gig: 0, intro: 0, contract: 0 }, log: [] };
    S.joined = (S.joined || 0) + 1; S.role = r; SF.award(r, 'join', t('Created a Startup Fest ID')); SF.notify(r, t('Welcome! Your ID is ready. Register for an event to earn points.'), '#/events');
    SF.closeModal(); SF.toast(t('Your ID is ready')); SF.go('#/me'); return; }
  if (f.id === 'apply-form') { const b = f.dataset.b; S.pipeline.push({ id: 'p' + Date.now(), brief: b, startup: val('a-st') || t('My startup'), stage: 0, day: 0, done: [], updates: [], value: 0, status: 'open', mine: true, pitch: val('a-sol') });
    SF.award('participant', 'apply', t('Applied to {c}', { c: SF.BRIEFS.find(x => x.id === b).co })); SF.notify('company', t('{s} applied to your brief', { s: val('a-st') }), '#/catalyst/' + b);
    SF.closeModal(); SF.toast(t('Application sent. Track it here.')); SF.render(); return; }
  if (f.id === 'decide-form') { const p = pid(f.dataset.p), ok = f.dataset.ok === '1'; p.note = val('d-note'); if (ok) p.stage = 1; else p.status = 'declined';
    SF.award(S.role, 'accept', t('Reviewed {s}', { s: p.startup })); if (p.mine) SF.notify('participant', ok ? t('{s} was selected for {c}', { s: p.startup, c: SF.BRIEFS.find(x => x.id === p.brief).co }) : t('{s} was not selected this time', { s: p.startup }), '#/catalyst/' + p.brief);
    SF.closeModal(); SF.toast(ok ? t('Accepted. The team is notified.') : t('Declined. The team sees your note.')); SF.render(); return; }
  if (f.id === 'update-form') { const p = pid(f.dataset.p), v = val('up-t'); if (!v) return; p.updates.unshift({ d: t('Day {d}', { d: p.day }), t: v }); SF.award(S.role, 'update', t('Posted a pilot update')); SF.render(); return; }
  if (f.id === 'contract-form') { const p = pid(f.dataset.p), v = parseInt(val('c-v').replace(/\D/g, ''), 10); if (!v) return SF.toast(t('Enter the contract value in UZS'));
    p.value = v; p.stage = 4; p.day = 100; SF.award(S.role, 'contract', t('Recorded a contract with {s}', { s: p.startup }));
    if (p.mine) { SF.award('participant', 'contract', t('Contract signed with {c}', { c: SF.BRIEFS.find(x => x.id === p.brief).co })); SF.notify('participant', t('Contract signed: {v}', { v: SF.uzs(v) }), '#/pilot/' + p.id); }
    SF.notify('org', t('{s} signed a contract worth {v}', { s: p.startup, v: SF.uzs(v) }), '#/admin'); SF.toast(t('Contract recorded')); SF.render(); return; }
  if (f.id === 'gig-form') { const ty = val('p-type'); S.gigs.unshift({ id: 'g' + Date.now(), title: val('p-title'), by: SF.me().name, kind: SF.ROLES[S.role].label, region: val('p-reg'), pay: ty === 'Job' ? 'Job' : (val('p-pay') || t('Paid')), type: ty });
    SF.award(S.role, 'post', t('Posted a gig')); SF.closeModal(); SF.toast(t('Gig published')); SF.render(); return; }
  if (f.id === 'brief-form') { SF.notify('org', t('New brief for review: {p}', { p: val('br-p').slice(0, 60) }), '#/catalyst'); SF.closeModal(); SF.toast(t('Brief sent for review. It goes live after the owner and budget are confirmed.')); return; }
  SF.formHandlers && SF.formHandlers(f, val);
});

/* ---------- boot ---------- */
SF.lang = SF.S.lang || 'en';
SF.renderChrome = () => {
  document.getElementById('demotools').innerHTML = `<span class="muted small">${t('Demo {v} · sample data · saved only in this browser', { v: SF.VERSION })}</span>
  <div class="row"><a class="linkbtn" href="#/roadmap">${t('Roadmap')}</a><button class="linkbtn" data-act="export">${t('Save scenario')}</button><button class="linkbtn" data-act="import">${t('Load scenario')}</button><button class="linkbtn" data-act="reset">${t('Reset demo')}</button></div>`;
  const ls = document.getElementById('lang'); if (ls) ls.value = SF.lang;
  document.getElementById('role').querySelectorAll('option').forEach(o => o.textContent = t(SF.ROLES[o.value].label));
  document.querySelector('label[for=role]').textContent = t('Viewing as');
  document.getElementById('bell').setAttribute('aria-label', t('Notifications'));
};
if (!location.hash) location.hash = '#/' + NAV[SF.S.role][0];
SF.render();
})();
