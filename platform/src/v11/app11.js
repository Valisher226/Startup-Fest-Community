// v11 actions: founder sign-in and check-in, the Org team's live portfolio
(() => {
const t = (s, v) => SF.t(s, v), A = SF.A, S = () => SF.S;
// the portfolio is public: every member type sees it, and so do guests
Object.keys(SF.NAV).forEach(r => { if (!SF.NAV[r].includes('portfolio')) SF.NAV[r].splice(r === 'org' ? 1 : SF.NAV[r].length - 1, 0, 'portfolio'); });
Object.assign(SF.LABEL, { portfolio: 'Portfolio', founder: 'My startup' });
SF.TAB_OF.pstartup = 'portfolio'; SF.TAB_OF.founder = null;
SF.PUBLIC.push('founder', 'portfolio', 'pstartup');
const GUEST_TABS = ['portfolio', 'impact', 'founder'];
const icon0 = SF.icon;
SF.icon = k => k === 'portfolio' ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>` : icon0(k);
const render10 = SF.render;
SF.render = () => { const v = (location.hash || '').split('/')[1] || '';
  if (!S().session && (!v || v === 'home')) history.replaceState(null, '', '#/portfolio');   // guests land on the public portfolio
  const v2 = (location.hash || '').split('/')[1] || '';
  document.body.classList.toggle('founder-page', v2 === 'founder'); render10();
  const guest = !S().session; document.body.classList.toggle('guest', guest);
  if (guest) document.getElementById('tabs').innerHTML = GUEST_TABS.map(k => `<a class="tab" href="#/${k}" ${(v2 === k || (k === 'portfolio' && v2 === 'pstartup')) ? 'aria-current="page"' : ''}>${SF.icon(k)}<span>${t(SF.LABEL[k])}</span></a>`).join(''); };

const F = () => SF.pf.f, O = () => SF.pf.o;
const FIELDS = ['name', 'one_liner', 'sector', 'region', 'link', 'stage', 'status', 'since_catalyst', 'can_recommend'];
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

// save what changed in the founder's draft; called on every step change and before confirming
const save = async () => { const f = F(); if (f.status !== 'ready') return true;
  const body = {}; FIELDS.forEach(k => { if (!same(f.draft[k], f.data[k])) body[k] = f.draft[k]; });
  if (body.name !== undefined && !String(body.name).trim()) { f.err = t('The startup needs a name.'); return false; }
  if (!Object.keys(body).length) return true;
  f.saving = true; f.err = '';
  try { const [row] = await SF.sb.rest('founder').patch('startups', 'id=eq.' + f.data.id, body); Object.assign(f.data, row); f.saved = true; return true; }
  catch (e) { f.err = t('Could not save: {e}', { e: e.message }); if (e.status === 401) { SF.sb.signOut('founder'); f.status = 'idle'; } return false; }
  finally { f.saving = false; } };
const readInputs = () => document.querySelectorAll('[data-pf]').forEach(el => { F().draft[el.dataset.pf] = el.value.trim(); });

Object.assign(A, {
  pfgo: async d => { readInputs(); const f = F(); if (!(await save())) return SF.render(); f.step = +d.n; f.saved = !!f.saved; SF.render(); window.scrollTo({ top: 0 }); },
  pfpick: d => { const f = F(), k = d.k;
    if (d.multi) { let v = f.draft[k]; v = v.includes(d.v) ? v.filter(x => x !== d.v) : d.v === 'nothing' ? ['nothing'] : [...v.filter(x => x !== 'nothing'), d.v]; f.draft[k] = v; }
    else f.draft[k] = k === 'can_recommend' ? d.v === 'true' : d.v;
    SF.render(); },
  pfdelmember: async d => { const f = F(), m = f.data.team_members.find(x => x.id === d.id); if (!m || !confirm(t('Remove {n} from the team?', { n: m.name }))) return;
    try { await SF.sb.rest('founder').del('team_members', 'id=eq.' + d.id); f.data.team_members = f.data.team_members.filter(x => x.id !== d.id); SF.toast(t('{n} removed', { n: m.name })); }
    catch (e) { SF.toast(t('Could not save: {e}', { e: e.message })); } SF.render(); },
  pfconfirm: async () => { readInputs(); const f = F(); if (!(await save())) return SF.render(); f.saving = true; SF.render();
    try { const at = await SF.sb.rest('founder').rpc('confirm_my_startup', { via: 'web' }); f.data.confirmed_at = at; SF.toast(t('Thank you! Your startup is confirmed.')); }
    catch (e) { f.err = t('Could not save: {e}', { e: e.message }); } f.saving = false; SF.render(); },
  pfout: d => { SF.sb.signOut(d.slot); if (d.slot === 'founder') SF.pf.f = { status: 'idle' }; else { SF.pf.o = { status: 'idle' }; SF.pf.hist = {}; } SF.render(); },
  pfreload: () => { SF.pf.o.status = 'idle'; SF.pf.p = { status: 'idle' }; SF.pf.hist = {}; SF.render(); },
  pfpw: () => SF.modal(`<h3>${t('Change my password')}</h3><form id="pf-pw" class="stack"><div class="field"><label for="pf-pw1">${t('New password (at least 8 characters)')}</label><input id="pf-pw1" type="password" minlength="8" autocomplete="new-password" required></div>
    <div class="row end"><button type="button" class="btn ghost" data-close="1">${t('Cancel')}</button><button class="btn">${t('Save')}</button></div></form>`),
  pfcsv: () => { const o = O(), rows = SF.pfFiltered(), q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const head = ['ID', 'Startup', 'One-liner', 'Sector', 'Region', 'Stage', 'Status', 'Since Catalyst', 'Can be recommended', 'Link', 'Batches', 'Team', 'Login owner', 'Owner phone', 'Owner Telegram', 'Login', 'Confirmed'];
    const csv = [head, ...rows.map(s => { const ow = s.team_members.find(m => m.is_owner) || {}; return [s.id, s.name, s.one_liner, s.sector, s.region, s.stage, s.status, s.since_catalyst.join('; '), s.can_recommend === null ? '' : s.can_recommend ? 'yes' : 'no', s.link,
      s.startup_batches.map(b => ((o.batches.find(x => x.id === b.batch_id) || {}).name || b.batch_id) + ': ' + b.result).join('; '), s.team_members.map(m => m.name + (m.role ? ' (' + m.role + ')' : '')).join('; '), ow.name, ow.phone, ow.telegram, (s.owners || {}).login, s.confirmed_at || '']; })].map(r => r.map(q).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); a.download = 'startupfest-portfolio.csv'; document.body.appendChild(a); a.click(); a.remove(); },
});

// role edits save when the field loses focus
document.addEventListener('change', async e => { const el = e.target; if (!el.dataset || !el.dataset.pfrole) return; const f = F(), m = f.data.team_members.find(x => x.id === el.dataset.pfrole); const role = el.value.trim(); if (!m || m.role === role) return;
  try { await SF.sb.rest('founder').patch('team_members', 'id=eq.' + m.id, { role }); m.role = role; f.saved = true; SF.toast(t('Saved')); } catch (err) { SF.toast(t('Could not save: {e}', { e: err.message })); } });
document.addEventListener('input', e => { const el = e.target; if (el.dataset && el.dataset.pf && F().draft) F().draft[el.dataset.pf] = el.value; });

const tries = { n: 0, until: 0 };
const fh10 = SF.formHandlers;
SF.formHandlers = (f, val) => {
  if (/^pf-login-/.test(f.id)) { const slot = f.dataset.slot, st = slot === 'founder' ? F() : O();
    if (Date.now() < tries.until) { st.err = t('Too many wrong passwords. Try again in {m} minutes.', { m: Math.ceil((tries.until - Date.now()) / 60000) }); return SF.render(); }
    st.status = 'signing'; st.err = ''; SF.render();
    SF.sb.signIn(slot, val('pf-l-' + slot), f.querySelector('#pf-p-' + slot).value)
      .then(() => { tries.n = 0; st.status = 'idle'; if (slot === 'org' && location.hash === '#/portfolio/staff') return SF.go('#/portfolio'); SF.render(); })
      .catch(e => { tries.n++; if (tries.n >= 5) { tries.until = Date.now() + 15 * 60000; tries.n = 0; }
        st.status = 'idle'; st.err = /invalid/i.test(e.message) ? t('Wrong login or password.') : t('Could not sign in: {e}', { e: e.message }); SF.render(); });
    return; }
  if (f.id === 'pf-add') { const name = val('pf-new'), role = val('pf-newrole'), fd = F(); if (!name) return;
    SF.sb.rest('founder').post('team_members', { startup_id: fd.data.id, name, role }).then(([m]) => { fd.data.team_members.push(m); SF.toast(t('{n} added', { n: name })); })
      .catch(e => SF.toast(t('Could not save: {e}', { e: e.message }))).finally(() => SF.render());
    return; }
  if (f.id === 'pf-pw') { const pw = f.querySelector('#pf-pw1').value; if (pw.length < 8) return SF.toast(t('At least 8 characters'));
    SF.sb.rest('founder').changePassword(pw).then(() => { SF.closeModal(); SF.toast(t('Password changed')); }).catch(e => SF.toast(t('Could not save: {e}', { e: e.message })));
    return; }
  return fh10(f, val);
};
SF.boot();
})();
