// v5 actions: content composer, publishing, launch review, calendar, reach, Instagram cards
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, A = SF.A, S = () => SF.S;
SF.NAV.org.splice(1, 0, 'content');
const WEEK = '27 Oct';

// draw the Instagram card after each render of the cards tab
const render0 = SF.render;
SF.render = () => { render0(); if ((location.hash || '').startsWith('#/content') && (S().filters.ctab === 'cards')) SF.drawCard(); };

const copy = text => { const done = () => SF.toast(t('Copied. Paste it into the Telegram channel.'));
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => fallback(text)); else fallback(text);
  function fallback(s) { const ta = document.createElement('textarea'); ta.value = s; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { SF.toast(t('Select the text in the preview and copy it')); } ta.remove(); } };

Object.assign(A, {
  postlang: d => { S().draft.lang = d.l; SF.render(); },
  copypost: d => copy(SF.postText(d.slot, S().draft.lang)),
  publish: d => { const s = d.slot, D = S().draft;
    if (s === 'mon') S().pub.mon = D.mon.map(i => SF.digestPool()[i]).filter(Boolean).map(x => ({ ...x }));
    if (s === 'wed') { const w = SF.wedPool().find(x => x.id === D.wed) || SF.wedPool()[0]; S().pub.wed = { guild: w.guild, t: w.t, s: w.s, go: w.go }; }
    if (s === 'thu') { S().pub.thu = D.thu.map(i => SF.thuPool()[i]).filter(Boolean).map(x => ({ ...x })); S().launches = S().pub.thu.map(x => x.v || 0); S().upvoted = []; }
    S().posts = S().posts.filter(p => !(p.week === WEEK && p.slot === s));
    S().posts.unshift({ id: 'po' + Date.now(), slot: s, week: WEEK, title: SF.SLOTS.find(x => x[0] === s)[2], lang: D.lang, views: 0 });
    Object.keys(SF.ROLES).filter(r => r !== 'org').forEach(r => SF.notify(r, t('New on Startup Fest: {p}', { p: t(SF.SLOTS.find(x => x[0] === s)[2]) }), '#/home'));
    SF.toast(t('Published. Members see it on their home page.')); SF.render(); },
  approve: d => { const q = S().launchQueue.find(x => x.id === d.id); S().approved = S().approved || []; S().approved.push({ n: q.n, t: q.t, v: 0 });
    S().launchQueue = S().launchQueue.filter(x => x.id !== d.id); S().draft.thu.push(SF.thuPool().length - 1);
    const who = Object.keys(S().people).find(k => S().people[k].name === q.by); if (who) SF.notify(who, t('Your launch “{n}” will be in Thursday’s post', { n: q.n }), '#/home');
    SF.toast(t('Approved and added to Thursday’s post')); SF.render(); },
  reject: d => { S().launchQueue = S().launchQueue.filter(x => x.id !== d.id); SF.toast(t('Declined')); SF.render(); },
  sharelaunch: () => { const team = SF.me('participant').fields.team || '';
    SF.modal(`<h3>${t('Share a launch')}</h3><p class="muted" style="margin:0">${t('The org team reviews it and adds it to Thursday’s post.')}</p>
    <form id="launch-form" class="stack"><div class="field"><label for="ln-n">${t('Startup')}</label><input id="ln-n" required value="${esc(team)}"></div>
    <div class="field"><label for="ln-t">${t('What did you launch?')}</label><input id="ln-t" required placeholder="${t('e.g. First 50 paying users')}"></div>
    <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="cta" type="submit"><span class="btn">${t('Send')}</span>${SF.ARROW}</button></div></form>`); },
  planslot: d => { S().plan[d.key] = 'planned'; SF.render(); },
  dlcard: () => { const cv = document.getElementById('igcard'); cv.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'startupfest-' + (S().filters.ctpl || 'wed') + '.png'; document.body.appendChild(a); a.click(); a.remove(); SF.toast(t('Saved {f}', { f: a.download })); }, 'image/png'); },
});

document.addEventListener('change', e => { const el = e.target; if (el.dataset.act !== 'pickitem') return; const D = S().draft, s = el.dataset.slot;
  if (s === 'wed') D.wed = el.dataset.i; else { const i = +el.dataset.i, arr = D[s]; if (el.checked && !arr.includes(i)) arr.push(i); if (!el.checked) D[s] = arr.filter(x => x !== i); D[s].sort((a, b) => a - b); }
  S().plan[WEEK + '|' + s] = 'draft'; SF.render(); });

const fh4 = SF.formHandlers;
SF.formHandlers = (f, val) => {
  if (f.id === 'extra-form') { S().draft.extra.push({ t: val('ex-t'), s: val('ex-s') || '', tag: 'All regions' }); S().draft.mon.push(SF.digestPool().length - 1); return SF.render(); }
  if (f.id === 'views-form') { const p = S().posts.find(x => x.id === val('vw-p')); p.views = parseInt(val('vw-n').replace(/\D/g, ''), 10) || 0; SF.toast(t('Views saved')); return SF.render(); }
  if (f.id === 'card-form') { S().cardText = { tp: f.dataset.tp, a: val('cd-a'), b: val('cd-b'), c: val('cd-c') }; return SF.drawCard(); }
  if (f.id === 'launch-form') { S().launchQueue.push({ id: 'lq' + Date.now(), n: val('ln-n'), t: val('ln-t'), by: SF.me().name }); SF.notify('org', t('{n} shared a launch for review', { n: val('ln-n') }), '#/content');
    SF.closeModal(); SF.toast(t('Sent for review')); return SF.render(); }
  return fh4 && fh4(f, val);
};
})();
