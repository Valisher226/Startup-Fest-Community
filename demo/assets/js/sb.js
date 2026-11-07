// v11: a tiny client for the real Startup Fest backend (Supabase). No library, works from file:// too.
// Only the publishable key lives here; every row is protected on the server by row-level security.
(() => {
const URL_ = 'https://qtxudvcbujesvfrweacm.supabase.co';
const KEY = 'sb_publishable_ZB2rsloqdNgU1R31dwHloA_q0JjL0rL';
const DOMAIN = '@portfolio.startupfest.uz';

const store = {
  get: k => { try { return JSON.parse(localStorage.getItem('sf-sb-' + k)); } catch (e) { return null; } },
  set: (k, v) => { try { v ? localStorage.setItem('sf-sb-' + k, JSON.stringify(v)) : localStorage.removeItem('sf-sb-' + k); } catch (e) { /* private window */ } },
};

class SbError extends Error { constructor(msg, status) { super(msg); this.status = status; } }

const call = async (path, { method = 'GET', body, token, headers = {} } = {}) => {
  const r = await fetch(URL_ + path, { method, headers: { apikey: KEY, 'Content-Type': 'application/json', Authorization: 'Bearer ' + (token || KEY), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text(); const data = text ? JSON.parse(text) : null;
  if (!r.ok) throw new SbError((data && (data.msg || data.message || data.error_description)) || r.statusText, r.status);
  return data;
};

// one session per "slot": founder (startup login) and org (staff login) never mix
const session = slot => store.get(slot);
const keep = (slot, d) => store.set(slot, { access: d.access_token, refresh: d.refresh_token, exp: Date.now() + (d.expires_in - 60) * 1000, user: d.user && d.user.id, email: d.user && d.user.email });

const signIn = async (slot, login, password) => {
  const email = login.includes('@') ? login.trim().toLowerCase() : login.trim().toLowerCase() + DOMAIN;
  const d = await call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
  keep(slot, d); return session(slot);
};
const signOut = slot => { const s = session(slot); store.set(slot, null); if (s) call('/auth/v1/logout', { method: 'POST', token: s.access }).catch(() => {}); };
const token = async slot => {
  const s = session(slot); if (!s) throw new SbError('signed out', 401);
  if (Date.now() < s.exp) return s.access;
  try { const d = await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: s.refresh } }); keep(slot, d); return d.access_token; }
  catch (e) { store.set(slot, null); throw new SbError('signed out', 401); }
};

const rest = slot => {
  const go = async (path, opts = {}) => call('/rest/v1/' + path, { ...opts, token: await token(slot), headers: { 'x-sf-via': 'web', ...(opts.headers || {}) } });
  return {
    get: path => go(path),
    patch: (table, filter, body) => go(`${table}?${filter}`, { method: 'PATCH', body, headers: { Prefer: 'return=representation' } }),
    post: (table, body) => go(table, { method: 'POST', body, headers: { Prefer: 'return=representation' } }),
    del: (table, filter) => go(`${table}?${filter}`, { method: 'DELETE' }),
    rpc: (fn, body = {}) => go('rpc/' + fn, { method: 'POST', body }),
    changePassword: async password => call('/auth/v1/user', { method: 'PUT', token: await token(slot), body: { password } }),
  };
};

// read-only public data for guests (only views granted to anon)
const anon = path => call('/rest/v1/' + path);
SF.sb = { signIn, signOut, session, rest, anon, SbError, DOMAIN };
})();
