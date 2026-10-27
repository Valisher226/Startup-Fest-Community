// v6 checks: login per member type, Common App-style sign-up, office hours, judging, peer groups, recognition
const base = require('./test5.js');
module.exports = async (h) => { await base(h); const { ok, $, $$, click, go, setRole, submit, wait, w } = h, SF = w.SF;
  const fill = (id, v) => { const el = $('#' + id); if (!el) throw new Error('missing #' + id); el.value = v; };
  const tickBox = (id, on = true) => { $('#' + id).checked = on; };
  const login = async (type, mail, pass) => { await go('#/login/' + type); fill('li-mail', mail); fill('li-pass', pass); submit($('#login-form')); await wait(20); if ($('#otp-form')) { fill('otp-c', SF.S.otp.code); submit($('#otp-form')); await wait(20); } };
  // signed out → every page goes to the login
  click($('[data-act="logout"]')); await wait(20); ok(!SF.S.session && location().startsWith('#/login'), 'log out returns to the login');
  await go('#/catalyst'); ok(location().startsWith('#/login') && !!$('#login-form'), 'signed-out visitors are sent to the login');
  ok($$('.auth-type').length === 7, 'login offers 7 member types');
  // every demo account signs in through its own login
  for (const a of SF.DEMO_ACCOUNTS) { await login(a.role, a.email, a.pass); ok(SF.S.session && SF.S.role === a.role && SF.account().email === a.email, `${a.role} signs in with its own login`);
    for (const v of SF.NAV[a.role]) { await go('#/' + v); ok($('#view').innerHTML.length > 200 && !$('#login-form'), `${a.role} → ${v} renders`); }
    click($('[data-act="logout"]')); await wait(10); }
  await login('investor', 'bekzod@demo.startupfest.uz', 'Mentor#2026'); ok(!SF.S.session && $('.alert').textContent.includes('Mentor'), 'a mentor account is refused on the investor login with a pointer');
  await login('mentor', 'bekzod@demo.startupfest.uz', 'wrong'); ok(!SF.S.session && !!$('.alert'), 'wrong password is refused');
  click($('[data-act="filldemo"]')); ok($('#li-pass').value === 'Mentor#2026', 'demo login can be filled in');
  // sign-up wizard for a mentor
  await go('#/signup'); ok($$('.wz-step').length === 7 && !!$('input[name=su-type]'), 'sign-up starts with the member type');
  submit($('#su-form')); await wait(10); ok(!!$('.ferr'), 'member type is required');
  const r = $('input[name=su-type][value=mentor]'); r.checked = true; r.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(10); submit($('#su-form')); await wait(10);
  ok(SF.S.signup.step === 1 && !!$('#su-pass'), 'step 2: create your account');
  fill('su-mail', 'bekzod@demo.startupfest.uz'); fill('su-pass', 'short'); fill('su-pass2', 'x'); submit($('#su-form')); await wait(10);
  ok($$('[aria-invalid="true"]').length >= 3 && SF.S.signup.step === 1, 'duplicate email, weak password and mismatch are caught');
  fill('su-mail', 'nigora@mail.uz'); fill('su-pass', 'Mentor#9999'); fill('su-pass2', 'Mentor#9999'); fill('su-heard', 'A friend'); submit($('#su-form')); await wait(10);
  ok(SF.S.signup.step === 2, 'step 3: personal information');
  fill('su-first', 'Nigora'); fill('su-last', 'Aliyeva'); fill('su-title', 'Product lead'); fill('su-phone', '+998 90 123 45 67'); $('input[name=su-langs][value=Uzbek]').checked = true; submit($('#su-form')); await wait(10);
  ok(SF.S.signup.step === 3 && !!$('#jf-expertise'), 'step 4: mentor profile with mentor questions');
  fill('jf-company', 'Uzum'); submit($('#su-form')); await wait(10);
  ok(SF.S.signup.step === 4 && !!$('input[name=su-topics]'), 'step 5: how you help');
  submit($('#su-form')); await wait(10); ok(SF.S.signup.step === 4 && !!$('.ferr'), 'topics and bio are required');
  $('input[name=su-topics][value=Pricing]').checked = true; fill('su-bio', 'Ten years building payment products in Tashkent; happy to help with pricing.'); submit($('#su-form')); await wait(10);
  ok(SF.S.signup.step === 5 && !!$('#su-pd'), 'step 6: consent and privacy');
  submit($('#su-form')); await wait(10); ok(SF.S.signup.step === 5, 'terms and personal data consent are required');
  tickBox('su-terms'); tickBox('su-pd'); submit($('#su-form')); await wait(10);
  ok(SF.S.signup.step === 6 && $('#view').innerHTML.includes('nigora@mail.uz'), 'step 7: review shows the answers');
  click($('[data-act="wzgo"][data-i="2"]')); await wait(10); ok(SF.S.signup.step === 2 && $('#su-first').value === 'Nigora', 'edit from review keeps answers');
  submit($('#su-form')); await wait(10); click($('[data-act="wzgo"][data-i="6"]')); await wait(10);
  tickBox('su-confirm'); submit($('#su-form')); await wait(20);
  ok(SF.S.session && SF.S.role === 'mentor' && SF.account().email === 'nigora@mail.uz' && SF.me().name === 'Nigora Aliyeva', 'account created and signed in');
  ok(SF.me().points === 20 && SF.S.notifs.some(n => n.role === 'org' && /Nigora/.test(n.t)), 'join points and org notified');
  SF.closeModal(); click($('[data-act="logout"]')); await wait(10);
  await login('mentor', 'nigora@mail.uz', 'Mentor#9999'); ok(SF.S.session && SF.me().name === 'Nigora Aliyeva', 'the new account signs in again');
  await login('mentor', 'bekzod@demo.startupfest.uz', 'Mentor#2026'); ok(SF.me().name === 'Bekzod Tursunov', 'switching back restores the demo mentor');
  // a participant under 18 is asked for a guardian
  click($('[data-act="logout"]')); await wait(10); await go('#/signup');
  const rp = $('input[name=su-type][value=participant]'); rp.checked = true; rp.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(10); submit($('#su-form')); await wait(10);
  fill('su-mail', 'kid@mail.uz'); fill('su-pass', 'Kid#20101'); fill('su-pass2', 'Kid#20101'); fill('su-heard', 'Instagram'); submit($('#su-form')); await wait(10);
  fill('su-first', 'Jasur'); fill('su-last', 'Karimov'); fill('su-dob', '2011-05-01'); fill('su-phone', '+998 91 222 33 44'); $('input[name=su-langs][value=Uzbek]').checked = true; submit($('#su-form')); await wait(10);
  fill('jf-team', 'Kids Coders'); fill('jf-skills', 'Robotics'); submit($('#su-form')); await wait(10);
  fill('jx-why', 'x'.repeat(220)); fill('jx-prob', 'Kids in Nukus have no robotics club near them.'); submit($('#su-form')); await wait(10);
  ok(!!$('#su-par'), 'under-18 founders are asked for a parent or guardian');
  SF.S.signup = { step: 0, type: '', data: {}, done: [] };
  // office hours
  await setRole('participant'); await go('#/hours'); const slot = $('[data-act="book"]'); const m = slot.dataset.m, s = slot.dataset.s; click(slot); await wait(10);
  fill('bk-t', 'How to price drone scans?'); submit($('#book-form')); await wait(10);
  const b = SF.S.bookings.find(x => x.topic === 'How to price drone scans?'); ok(b && b.mentor === m && b.status === 'Booked', 'participant books a mentor slot');
  ok(!$$('[data-act="book"]').some(x => x.dataset.m === m && x.dataset.s === s), 'the booked slot disappears');
  await setRole('mentor'); await go('#/hours'); const open0 = SF.S.avail['Bekzod Tursunov'].length; click($('[data-act="ohslot"]')); await wait(10); ok(SF.S.avail['Bekzod Tursunov'].length !== open0, 'mentor opens or closes a slot');
  const mine = SF.S.bookings.find(x => x.mentor === 'Bekzod Tursunov' && x.status === 'Booked'); click($(`[data-act="ohdone"][data-id="${mine.id}"]`)); await wait(10); fill('oh-n', 'Charge per hectare.'); submit($('#ohnote-form')); await wait(10);
  ok(mine.status === 'Done' && mine.notes === 'Charge per hectare.', 'mentor marks a session done with notes');
  await setRole('participant'); await go('#/hours'); const rb = $('[data-act="ohrate"][data-n="5"]'); if (rb) { click(rb); await wait(10); } ok(SF.S.bookings.some(x => x.rating === 5 && x.by === 'Aziza Rahimova' && x.mentor === 'Bekzod Tursunov'), 'founder rates the session');
  // judging
  await setRole('mentor'); await go('#/judge'); ok($$('select[data-score]').length === 15, 'scorecards for 3 Samarkand teams × 5 criteria');
  click($('[data-act="submitscores"]')); await wait(10); ok(!SF.S.scores['j-sam']['Bekzod Tursunov'], 'incomplete scorecards are not submitted');
  for (let i = 0; i < 15; i++) { const el = $$('select[data-score]')[i]; el.value = String(i < 5 ? 9 : 6); el.dispatchEvent(new w.Event('change', { bubbles: true })); await wait(2); }
  click($('[data-act="submitscores"]')); await wait(10); if (process.env.DBG) console.log(JSON.stringify(SF.S.judgeDraft), JSON.stringify(SF.leader('j-sam').map(x=>[x.n,x.avg]))); ok(!!SF.S.scores['j-sam']['Bekzod Tursunov'] && SF.leader('j-sam')[0].n === 'AgroLens', 'scores submitted and the leaderboard updates');
  await setRole('org'); await go('#/judge'); click($('[data-act="lockres"]')); await wait(10);
  ok(SF.S.locked['j-sam'] && SF.S.finalists['Samarkand|University'], 'org locks results and finalists go to the season');
  // peer groups
  await setRole('participant'); await go('#/peers'); const inv0 = SF.S.invoices.length; click($('[data-act="peerjoin"][data-g="pg1"]')); await wait(10); submit($('#peer-form')); await wait(10);
  ok(SF.myPeer() && SF.myPeer().id === 'pg1' && SF.S.invoices.length === inv0, 'regional finalist joins a peer group for free');
  await setRole('sme'); await go('#/peers'); click($('[data-act="peerjoin"][data-g="pg3"]')); await wait(10); submit($('#peer-form')); await wait(10);
  ok(SF.S.invoices.length === inv0 + 1 && SF.S.invoices[0].plan === 'peer' && SF.S.invoices[0].to === 'Nodira Yusupova', 'small business pays 150 000 so‘m and joins');
  await setRole('participant'); await go('#/peers');
  fill('pn-t', 'My number: 5 paying farms'); submit($('#peernote-form')); await wait(10); ok(SF.S.peer.notes.pg1[0].t === 'My number: 5 paying farms', 'session note added');
  await go('#/admin'); await setRole('org'); await go('#/admin'); ok($('#view').innerHTML.includes('#/peers') && $('#view').innerHTML.includes(SF.t('Programmes')), 'dashboard shows programme health');
  // recognition
  await setRole('participant'); await go('#/fellows'); click($('[data-act="recogapply"][data-l="Champion"]')); await wait(10); fill('rc-s', 'Ran Startup Night Samarkand twice.'); fill('rc-r1', 'Bekzod Tursunov'); fill('rc-r2', 'Jasur Qodirov'); submit($('#recog-form')); await wait(10);
  const ap = SF.S.recog.find(x => x.name === 'Aziza Rahimova'); ok(ap && ap.status === 'Submitted', 'Champion application sent');
  await setRole('org'); await go('#/fellows'); click($(`[data-act="recogok"][data-id="${ap.id}"]`)); await wait(10); ok(ap.status === 'Approved' && ap.renews === 'Oct 2027', 'org approves with a yearly renewal date');
  await setRole('mentor'); await go('#/fellows'); click($('[data-act="renew"]')); await wait(10); fill('rn-s', '40 office hours'); submit($('#renew-form')); await wait(10); ok(SF.S.recog.find(x => x.id === 'fa1').status === 'Renewal submitted', 'mentor renews Champion status');
  // account settings
  await go('#/account'); fill('pw-old', 'Mentor#2026'); fill('pw-new', 'Mentor#2027'); fill('pw-new2', 'Mentor#2027'); submit($('#pass-form')); await wait(10); ok(SF.account().pass === 'Mentor#2027', 'password changed in account settings');
  click($('[data-act="logout"]')); await wait(10); await login('mentor', 'bekzod@demo.startupfest.uz', 'Mentor#2027'); ok(SF.S.session && SF.S.role === 'mentor', 'signs in with the new password');
  function location() { return w.location.hash; }
};
