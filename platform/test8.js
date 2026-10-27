// v8 checks: permissions, lockout, suspension, two-step code, invites, privacy centre, audit log, idle timeout
const base = require('./test7.js');
module.exports = async (h) => { await base(h); const { ok, $, $$, click, go, setRole, submit, wait, w } = h, SF = w.SF;
  const fill = (id, v) => { const el = $('#' + id); if (!el) throw new Error('missing #' + id); el.value = v; };
  const tryLogin = async (type, mail, pass) => { await go('#/login/' + type); fill('li-mail', mail); fill('li-pass', pass); submit($('#login-form')); await wait(15); };
  // non-org cannot open org pages
  await setRole('participant'); await go('#/users'); ok(location().startsWith('#/noaccess'), 'participants are blocked from Users');
  // permissions: block office hours for participants
  await setRole('org'); await go('#/permissions'); const cb = $('input[data-perm="hours"][data-r="participant"]'); cb.checked = false; cb.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(10);
  ok(!SF.S.perms.hours.includes('participant') && SF.S.audit[0].type === 'Permissions', 'org blocks a feature and it is audited');
  await setRole('participant'); await go('#/home'); ok(!$$('#tabs a').some(a => a.getAttribute('href') === '#/hours'), 'blocked feature disappears from the menu');
  await go('#/hours'); ok(location().startsWith('#/noaccess'), 'direct link to a blocked feature is refused');
  await setRole('org'); await go('#/permissions'); click($('[data-act="permreset"]')); await wait(10); ok(SF.S.perms.hours.includes('participant'), 'defaults restored');
  // two-step code for the org team
  click($('[data-act="logout"]')); await wait(10); await tryLogin('org', 'team@demo.startupfest.uz', 'Team#2026'); ok(!!$('#otp-form') && !SF.S.session, 'org sign-in asks for a 6-digit code');
  fill('otp-c', '000000'); submit($('#otp-form')); await wait(10); ok(!SF.S.session, 'wrong code is refused');
  fill('otp-c', SF.S.otp.code); submit($('#otp-form')); await wait(15); ok(SF.S.session && SF.S.role === 'org', 'right code signs in');
  // suspend and invite
  await go('#/users'); click($('[data-act="ustatus"][data-id="acc-scout"][data-s="suspended"]')); await wait(10); ok(SF.S.accounts.find(a => a.id === 'acc-scout').status === 'suspended', 'org suspends the scouting account');
  click($('[data-act="invite"]')); await wait(10); fill('iv-name', 'Lola Karimova'); fill('iv-mail', 'lola@mail.uz'); $('#iv-type').value = 'company'; submit($('#invite-form')); await wait(10);
  const inv = SF.S.accounts.find(a => a.email === 'lola@mail.uz'); ok(inv && inv.mustChange && $('.temp-pass').textContent.includes(inv.pass), 'invite creates an account with a temporary password');
  SF.closeModal(); click($('[data-act="logout"]')); await wait(10);
  await tryLogin('scout', 'scouting@demo.startupfest.uz', 'Scout#2026'); ok(!SF.S.session && $('.alert').textContent.includes(SF.t('This account is suspended. Contact the Startup Fest team.')), 'suspended account cannot sign in');
  await tryLogin('company', 'lola@mail.uz', inv.pass); ok(SF.S.session && SF.account().email === 'lola@mail.uz' && !!w.document.getElementById('mustchange'), 'invited member signs in and is asked to change the password');
  await go('#/account'); fill('pw-old', inv.pass); fill('pw-new', 'Lola#20266'); fill('pw-new2', 'Lola#20266'); submit($('#pass-form')); await wait(10); ok(!SF.account().mustChange && SF.S.audit[0].act === 'Changed the password', 'new password set and audited');
  // privacy centre: consent, download, delete
  await go('#/privacy'); const sw = $('input[data-consent="mail"]'); sw.checked = false; sw.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(10);
  ok(SF.account().consent.mail === false && SF.S.consentLog[0].who === 'Lola Karimova', 'consent withdrawn with history');
  click($('[data-act="mydata"]')); await wait(5); ok(SF.S.audit[0].act === 'Downloaded own data', 'data download is audited');
  click($('[data-act="delacct"]')); await wait(5); fill('del-c', 'DELETE'); submit($('#del-form')); await wait(15); ok(!SF.S.accounts.some(a => a.email === 'lola@mail.uz') && !SF.S.session && SF.me('company').name === 'AgroVodiy Holding', 'own account deleted; demo company restored');
  // lockout after 5 wrong passwords
  for (let i = 0; i < 5; i++) await tryLogin('investor', 'dilnoza@demo.startupfest.uz', 'nope' + i);
  await tryLogin('investor', 'dilnoza@demo.startupfest.uz', 'Investor#2026'); ok(!SF.S.session && /15/.test($('.alert').textContent), 'five wrong passwords lock the login');
  SF.S.fails = {}; await tryLogin('investor', 'dilnoza@demo.startupfest.uz', 'Investor#2026'); ok(SF.S.session, 'login works after the lock ends');
  // idle timeout when not kept signed in
  SF.S.remember = false; SF.S.session.seen = Date.now() - 31 * 60000; SF.render(); ok(!SF.S.session && !!$('.alert'), 'signed out after 30 minutes without activity'); SF.S.remember = true;
  // audit log page and export
  await setRole('org'); await go('#/audit'); ok($$('#view tbody tr').length > 10, 'audit log lists actions'); click($('[data-act="filter"][data-k="atype"][data-v="Security"]')); await wait(10);
  ok($$('#view tbody tr').every(r => r.textContent.includes(SF.t('Security'))), 'audit log filters by type'); click($('[data-act="auditcsv"]')); await wait(5); ok(SF.S.audit[0].act === 'Exported the audit log', 'audit export recorded');
  await go('#/events/e1'); ok(!!$('[data-act="camscan"]'), 'camera check-in button on the event page'); click($('[data-act="camscan"]')); await wait(10); ok(!!$('#camnote'), 'camera modal explains when scanning is not available'); SF.closeModal();
  await go('#/backend'); ok($('#view').innerHTML.includes(SF.t('What the real platform needs')), 'backend plan renders');
  SF.S.accounts.find(a => a.id === 'acc-scout').status = 'active';
  function location() { return w.location.hash; }
};
