// Small UI helpers shared by all views
(() => {
const I = {
  home: '<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  events: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  catalyst: '<path d="M3 21V10l6 4V10l6 4V4h6v17z"/>',
  earn: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  directory: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>',
  messages: '<path d="M4 4h16v12H8l-4 4z"/>',
  community: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-3 3-5 6-5s6 2 6 5M12 20c0-3 2-5 5-5s5 2 5 5"/>',
  me: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17c.6-2 2-3 3.5-3s2.9 1 3.5 3M14 9h5M14 13h4"/>',
  admin: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  season: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
};
SF.icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${I[k] || ''}</svg>`;
SF.SPARK = '<svg class="spark" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z"/></svg>';
SF.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
SF.fmt = n => Number(n).toLocaleString('en-US');
SF.uzs = n => { const L = { uz: [' mlrd so‘m', ' mln so‘m', ' so‘m'], ru: [' млрд сум', ' млн сум', ' сум'] }[SF.lang] || ['B UZS', 'M UZS', ' UZS'];
  return n >= 1e9 ? (n / 1e9).toFixed(1).replace(/\.0$/, '') + L[0] : n >= 1e6 ? Math.round(n / 1e6) + L[1] : SF.fmt(n) + L[2]; };
SF.initials = n => String(n).split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
SF.toast = msg => { const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg; document.body.appendChild(el); setTimeout(() => el.remove(), 2800); };
SF.modal = html => {
  document.getElementById('layer').innerHTML = `<div class="scrim" data-close="1"><div class="card pad modal stack" role="dialog" aria-modal="true">${html}</div></div>`;
  const f = document.querySelector('.modal input:not([type=checkbox]),.modal select,.modal textarea'); f && f.focus();
};
SF.closeModal = () => { document.getElementById('layer').innerHTML = ''; };
SF.back = (href, label) => `<a class="backlink" href="${href}">${SF.icon('back')}<span>${SF.esc(label)}</span></a>`;
SF.go = h => { if (location.hash === h) SF.render(); else location.hash = h; };
})();
