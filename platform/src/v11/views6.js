// v6 views: login per member type, step-by-step sign-up, account settings, office hours, judging, peer groups, recognition
(() => {
const t = (s, v) => SF.t(s, v), esc = SF.esc, V = SF.V;
const S = () => SF.S, role = () => SF.S.role;
const sh = (title, right = '') => `<div class="sec-h"><h2>${title}</h2>${right}</div>`;
const R = k => SF.ROLES[k];
SF.ui = SF.ui || {}; // transient UI state (errors, toggles); never saved

/* ---------- accounts helpers ---------- */
SF.account = () => S().session && S().accounts.find(a => a.id === S().session.acc);
SF.myName = () => { const a = SF.account(); return a ? a.contact : SF.me().name; };
SF.myNameOf = r => { const a = SF.S.accounts.find(x => x.id === SF.S.slot[r]); return a ? a.contact : SF.me(r).name; };
SF.PUBLIC = ['login', 'signup', 'forgot'];

/* ---------- Login: one door per member type ---------- */
V.login = p => {
  const type = R(p) ? p : (SF.ui.loginType || 'participant'), info = SF.ROLE_INFO[type], err = SF.ui.loginErr, c = R(type).color;
  SF.ui.loginType = type;
  return `<div class="auth">
  <aside class="auth-side">
    <div class="auth-star" aria-hidden="true">${SF.STAR(300, '#fff')}</div>
    <h1 class="display">${t('SIGN IN')}</h1>
    <p>${t('Every member type has its own login. Choose yours.')}</p>
    <nav class="auth-types" aria-label="${t('Member type')}">${Object.keys(SF.ROLES).map(k => `<a href="#/login/${k}" class="auth-type" ${k === type ? 'aria-current="page"' : ''} style="--rc:${R(k).color}"><span class="dot"></span><span class="grow"><b>${t(R(k).label)}</b><small>${t(SF.ROLE_INFO[k][0])}</small></span>${SF.ARROW}</a>`).join('')}</nav>
  </aside>
  <section class="card pad auth-main stack" style="--rc:${c}">
    <span class="chip rc">${t('{r} login', { r: t(R(type).label) })}</span>
    <h2 class="display" style="font-size:clamp(36px,4vw,52px)">${t('Welcome back')}</h2>
    <p class="muted" style="margin:0">${t(info[1])}</p>
    ${err ? `<div class="alert" role="alert">${err}</div>` : ''}
    <form id="login-form" data-type="${type}" class="stack" novalidate>
      <div class="field"><label for="li-mail">${t('Email')}</label><input id="li-mail" type="email" autocomplete="username" required value="${esc(SF.ui.loginMail || '')}" placeholder="name@mail.uz"></div>
      <div class="field"><label for="li-pass">${t('Password')}</label><div class="pass"><input id="li-pass" type="password" autocomplete="current-password" required><button type="button" class="linkbtn" data-act="showpass" data-for="li-pass">${t('Show')}</button></div></div>
      <div class="row between small"><label class="row" style="gap:8px"><input type="checkbox" id="li-rem" ${S().remember ? 'checked' : ''}> ${t('Keep me signed in')}</label><button type="button" class="linkbtn" data-act="forgot">${t('Forgot password?')}</button></div>
      <button class="cta" type="submit" style="align-self:start"><span class="btn">${t('Sign in')}</span>${SF.ARROW}</button>
    </form>
    <div class="demo-hint"><b>${t('Demo')}</b><span>${t('Logins for every member type are in LOGINS.txt, next to index.html.')}</span><button class="linkbtn" data-act="filldemo" data-type="${type}">${t('Fill the demo login')}</button></div>
    <div class="auth-foot">${type === 'org' ? `<span class="muted">${t('Org team accounts are created by invitation only.')}</span>`
      : `<span>${t('New to Startup Fest?')}</span><a class="btn ghost sm" href="#/signup" data-act="signupas" data-type="${type}">${t('Create a {r} account', { r: t(R(type).label) })}</a>`}</div>
  </section></div>`;
};

/* ---------- Sign-up wizard (Common App style: pick a type, then sections with progress) ---------- */
const PROFILE = { participant: 'Founder profile', mentor: 'Mentor profile', investor: 'Investor profile', company: 'Company profile', sme: 'Business profile', scout: 'Scouting profile' };
const GOALS = { participant: 'Your idea', mentor: 'How you help', investor: 'Investment focus', company: 'Your challenge', sme: 'What you need', scout: 'What you are looking for' };
SF.signupSteps = type => [['type', 'Member type'], ['account', 'Create your account'], ['personal', 'Personal information'], ['profile', PROFILE[type] || 'Profile'], ['goals', GOALS[type] || 'Goals'], ['consent', 'Consent and privacy'], ['review', 'Review and submit']];
const ORG_TYPES = ['company', 'sme', 'scout'];
const STEP_INFO = {
  type: 'Choose how you will use Startup Fest. You can create another account later for a different member type.',
  account: 'This email and password are your login. You will sign in through the {r} login.',
  personal: 'Tell us who you are. Your region decides which council and events you see first.',
  profile: 'These details go on your Startup Fest ID and help us match you.',
  goals: 'A few questions in your own words. Partners read these when they review you.',
  consent: 'You decide what we can share and how we contact you.',
  review: 'Check everything once. You can edit any section before you submit.',
};
const D = () => S().signup.data;
const err = id => (SF.ui.wzErr || {})[id] ? `<span class="ferr" id="${id}-err">${t(SF.ui.wzErr[id])}</span>` : '';
const inv = id => (SF.ui.wzErr || {})[id] ? `aria-invalid="true" aria-describedby="${id}-err"` : '';
const inp = (id, label, o = {}) => `<div class="field"><label for="${id}">${t(label)}${o.opt ? ` <span class="muted">(${t('optional')})</span>` : ''}</label><input id="${id}" type="${o.type || 'text'}" ${o.auto ? `autocomplete="${o.auto}"` : ''} ${o.mode ? `inputmode="${o.mode}"` : ''} value="${esc(D()[id] ?? o.val ?? '')}" placeholder="${esc(o.ph ? t(o.ph) : '')}" ${inv(id)}>${o.hint ? `<span class="hint">${t(o.hint)}</span>` : ''}${err(id)}</div>`;
const sel = (id, label, opts, o = {}) => `<div class="field"><label for="${id}">${t(label)}</label><select id="${id}" ${inv(id)}>${o.blank ? `<option value="">${t('Choose…')}</option>` : ''}${opts.map(x => `<option value="${esc(x)}" ${(D()[id] ?? o.val) === x ? 'selected' : ''}>${t(x)}</option>`).join('')}</select>${err(id)}</div>`;
const area = (id, label, o = {}) => { const v = D()[id] || ''; return `<div class="field"><label for="${id}">${t(label)}</label><textarea id="${id}" data-count="${o.min || 0}-${o.max || 0}" ${inv(id)} placeholder="${esc(o.ph ? t(o.ph) : '')}">${esc(v)}</textarea>
  <span class="hint row between"><span>${o.min ? t('{a}–{b} characters', { a: o.min, b: o.max }) : ''}</span><span class="num" id="${id}-n">${v.length}${o.max ? ' / ' + o.max : ''}</span></span>${err(id)}</div>`; };
const checks = (name, label, opts) => { const on = D()[name] || []; return `<fieldset class="field checks" ${inv(name)}><legend>${t(label)}</legend><div class="chk-grid">${opts.map(x => `<label class="chk"><input type="checkbox" name="${name}" value="${esc(x)}" ${on.includes(x) ? 'checked' : ''}><span>${t(x)}</span></label>`).join('')}</div>${err(name)}</fieldset>`; };
const tick = (id, label, o = {}) => `<label class="chk wide ${o.req ? 'req' : ''}"><input type="checkbox" id="${id}" ${D()[id] ?? o.val ? 'checked' : ''} ${inv(id)}><span>${label}</span></label>${err(id)}`;
SF.pwRules = p => [[p.length >= 8, '8 or more characters'], [/[A-Z]/.test(p), 'A capital letter'], [/[a-z]/.test(p), 'A small letter'], [/\d/.test(p), 'A number'], [/[^A-Za-z0-9]/.test(p), 'A symbol, like # or !']];
SF.pwList = p => `<ul class="pw-rules" id="pw-rules" aria-live="polite">${SF.pwRules(p).map(([ok, x]) => `<li class="${ok ? 'ok' : ''}">${ok ? '✓' : '○'} ${t(x)}</li>`).join('')}</ul>`;
SF.isMinor = dob => { if (!dob) return false; const b = new Date(dob), n = new Date('2026-10-25'); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a < 18; };

const stepBody = (key, type) => {
  const d = D();
  if (key === 'type') return `<div class="type-grid" role="radiogroup" aria-label="${t('Member type')}">${Object.keys(SF.ROLES).map(k => { const dis = k === 'org';
    return `<label class="type-card ${dis ? 'off' : ''}" style="--rc:${R(k).color}"><input type="radio" name="su-type" value="${k}" ${type === k ? 'checked' : ''} ${dis ? 'disabled' : ''}>
    <span class="tc-top"><span class="dot"></span><b>${t(R(k).label)}</b></span><span class="muted small">${t(SF.ROLE_INFO[k][0])}</span><span class="small">${t(SF.ROLE_INFO[k][1])}</span></label>`; }).join('')}</div>${err('su-type')}`;
  if (key === 'account') return `${inp('su-mail', 'Email', { type: 'email', auto: 'email', ph: 'name@mail.uz' })}
    <div class="field"><label for="su-pass">${t('Password')}</label><div class="pass"><input id="su-pass" type="password" autocomplete="new-password" value="${esc(d['su-pass'] || '')}" ${inv('su-pass')}><button type="button" class="linkbtn" data-act="showpass" data-for="su-pass">${t('Show')}</button></div>${SF.pwList(d['su-pass'] || '')}${err('su-pass')}</div>
    ${inp('su-pass2', 'Confirm password', { type: 'password', auto: 'new-password' })}
    ${sel('su-heard', 'How did you hear about Startup Fest?', SF.HEARD, { blank: 1 })}`;
  if (key === 'personal') return `<div class="two">${inp('su-first', 'First name', { auto: 'given-name' })}${inp('su-last', 'Last name', { auto: 'family-name' })}</div>
    ${inp('su-pref', 'Preferred name', { opt: 1 })}
    ${type === 'participant' ? inp('su-dob', 'Date of birth', { type: 'date', hint: 'Under 18? We will ask for a parent or guardian in the consent step.' }) : inp('su-title', 'Job title', { ph: 'e.g. Head of Innovation' })}
    <div class="two">${inp('su-phone', 'Phone number', { mode: 'tel', val: '+998 ', auto: 'tel' })}${inp('su-tg', 'Telegram username', { ph: '@username', opt: 1 })}</div>
    ${sel('su-reg', 'Region', SF.REGIONS, { val: 'Tashkent city' })}
    ${checks('su-langs', 'Languages you speak', SF.SPOKEN)}`;
  if (key === 'profile') return `${ORG_TYPES.includes(type) ? `<div class="two">${inp('su-org', { company: 'Company name', sme: 'Business name', scout: 'Organisation name' }[type])}${inp('su-inn', 'Tax ID (INN)', { mode: 'numeric', ph: '302 456 789', hint: '9 digits' })}</div>` : ''}
    ${(SF.ROLE_FIELDS[type] || []).map(f => f.type === 'select' ? sel('jf-' + f.k, f.label, f.options) : inp('jf-' + f.k, f.label, { ph: f.ph })).join('')}
    ${type === 'participant' ? `<div class="two">${sel('jx-track', 'Chosen track', SF.TRACK_OPTIONS)}${sel('jx-level', 'Experience level', SF.LEVEL_OPTIONS)}</div>` : ''}
    ${type === 'investor' ? sel('su-kind', 'Investor type', ['Angel', 'Venture fund', 'Corporate VC', 'Family office']) : ''}`;
  if (key === 'goals') return {
    participant: `${area('jx-why', 'Why do you want to take part?', { min: 200, max: 500 })}${area('jx-prob', 'Which problem do you want to solve?', { min: 30, max: 400 })}${area('jx-skills', 'Skills and previous projects', { max: 400 })}`,
    mentor: `${checks('su-topics', 'Topics you can help with', SF.SIGNUP_TOPICS)}${area('su-bio', 'A short bio founders will see', { min: 50, max: 300 })}<div class="two">${sel('su-judge', 'Can you judge at regional stages?', ['Yes', 'Maybe', 'No'])}${sel('su-mode', 'Office hours', ['Online and in person', 'Online only', 'In person only'])}</div>`,
    investor: `${area('su-thesis', 'Your investment thesis', { min: 50, max: 400 })}<div class="two">${sel('su-deals', 'Deals per year', ['1–2', '3–5', '6–10', '10+'])}${sel('su-lead', 'Do you lead rounds?', ['Yes', 'Sometimes', 'No, I follow'])}</div>${tick('su-vip', t('I want to apply to the Verified Investor Programme'))}`,
    company: `${area('su-chal', 'Which problem should startups solve for you?', { min: 50, max: 500 })}<div class="two">${sel('su-budget', 'Pilot budget', ['Under 20M UZS', '20–50M UZS', '50–150M UZS', '150M+ UZS'])}${sel('su-host', 'Would you host a Catalyst day?', ['Yes', 'Maybe later', 'No'])}</div>`,
    sme: `${checks('su-needs', 'What do you need help with?', SF.SME_NEEDS)}${area('su-prob', 'Describe the problem in a few lines', { min: 30, max: 400 })}${sel('su-month', 'Monthly budget for help', ['Under 1M UZS', '1–3M UZS', '3–10M UZS', '10M+ UZS'])}`,
    scout: `${area('su-want', 'Which startups are you looking for?', { min: 50, max: 400 })}${sel('su-size', 'Startups per shortlist', ['3', '5', '10'])}${tick('su-fee', t('I understand Startup Fest charges a sourcing fee for each shortlist ({p}) or a yearly retainer.', { p: SF.uzs(5e6) }), { req: 1 })}`,
  }[type] || '';
  if (key === 'consent') { const minor = type === 'participant' && SF.isMinor(d['su-dob']);
    return `<div class="stack" style="gap:10px"><b>${t('How we contact you')}</b>${tick('su-c-tg', t('Weekly digest in Telegram'), { val: true })}${tick('su-c-mail', t('Event reminders by email'), { val: true })}${tick('su-c-sms', t('SMS when a payment or ticket needs action'))}</div>
    <div class="stack" style="gap:10px"><b>${t('Sharing')}</b>${tick('su-c-rec', type === 'participant' ? t('Startup Fest may recommend my profile to partners') : t('Show my profile in the member directory'), { val: true })}</div>
    ${minor ? `<div class="card pad stack" style="background:#fafafa"><b>${t('Parent or guardian')}</b><span class="muted small">${t('You are under 18, so a parent or guardian must agree before your ID goes live.')}</span><div class="two">${inp('su-par', 'Their full name')}${inp('su-parph', 'Their phone', { mode: 'tel', val: '+998 ' })}</div></div>` : ''}
    <div class="stack" style="gap:10px"><b>${t('Required')}</b>${tick('su-terms', t('I agree to the Startup Fest terms of use and community rules'), { req: 1 })}${tick('su-pd', t('I agree that Startup Fest processes my personal data under the Law of Uzbekistan “On personal data” and stores it in Uzbekistan'), { req: 1 })}</div>`; }
  if (key === 'review') { const sec = SF.signupSteps(type).slice(1, -1);
    const show = (k, label) => d[k] === undefined || d[k] === '' || (Array.isArray(d[k]) && !d[k].length) ? '' : `<div class="rv"><span class="muted">${t(label)}</span><span>${esc(Array.isArray(d[k]) ? d[k].map(x => t(x)).join(', ') : d[k] === true ? t('Yes') : d[k] === false ? t('No') : t(d[k]))}</span></div>`;
    const rows = {
      account: show('su-mail', 'Email') + `<div class="rv"><span class="muted">${t('Password')}</span><span>••••••••</span></div>` + show('su-heard', 'How did you hear about Startup Fest?'),
      personal: show('su-first', 'First name') + show('su-last', 'Last name') + show('su-dob', 'Date of birth') + show('su-title', 'Job title') + show('su-phone', 'Phone number') + show('su-tg', 'Telegram username') + show('su-reg', 'Region') + show('su-langs', 'Languages you speak'),
      profile: show('su-org', 'Name') + show('su-inn', 'Tax ID (INN)') + (SF.ROLE_FIELDS[type] || []).map(f => show('jf-' + f.k, f.label)).join('') + show('jx-track', 'Chosen track') + show('jx-level', 'Experience level') + show('su-kind', 'Investor type'),
      goals: ['jx-why', 'jx-prob', 'su-topics', 'su-bio', 'su-thesis', 'su-chal', 'su-needs', 'su-prob', 'su-want', 'su-judge', 'su-deals', 'su-budget', 'su-host', 'su-month', 'su-size'].map(k => show(k, { 'jx-why': 'Why do you want to take part?', 'jx-prob': 'Which problem do you want to solve?', 'su-topics': 'Topics you can help with', 'su-bio': 'Bio', 'su-thesis': 'Your investment thesis', 'su-chal': 'Which problem should startups solve for you?', 'su-needs': 'What do you need help with?', 'su-prob': 'Describe the problem in a few lines', 'su-want': 'Which startups are you looking for?', 'su-judge': 'Can you judge at regional stages?', 'su-deals': 'Deals per year', 'su-budget': 'Pilot budget', 'su-host': 'Would you host a Catalyst day?', 'su-month': 'Monthly budget for help', 'su-size': 'Startups per shortlist' }[k])).join(''),
      consent: show('su-c-tg', 'Weekly digest in Telegram') + show('su-c-mail', 'Event reminders by email') + show('su-c-rec', 'Sharing') + show('su-par', 'Parent or guardian') + `<div class="rv"><span class="muted">${t('Required')}</span><span>✓ ${t('Accepted')}</span></div>`,
    };
    return `<div class="rv-head"><span class="mini" style="background:${R(type).color}">${SF.initials((d['su-first'] || '?') + ' ' + (d['su-last'] || ''))}</span><div><b>${esc((d['su-first'] || '') + ' ' + (d['su-last'] || ''))}</b><div class="muted small">${t(R(type).label)}${d['su-org'] ? ' · ' + esc(d['su-org']) : ''}</div></div></div>
    ${sec.map(([k, label], i) => `<div class="rv-sec"><div class="row between"><b>${t(label)}</b><button type="button" class="linkbtn" data-act="wzgo" data-i="${i + 1}">${t('Edit')}</button></div>${rows[k] || ''}</div>`).join('')}
    ${tick('su-confirm', t('I confirm that this information is true'), { req: 1 })}`; }
  return '';
};
V.signup = () => {
  const su = S().signup, type = su.type, steps = SF.signupSteps(type), i = Math.min(su.step, steps.length - 1), [key, title] = steps[i];
  const pct = Math.round(su.done.length / (steps.length - 1) * 100), c = type ? R(type).color : 'var(--accent)';
  const state = (k, j) => su.done.includes(k) ? 'done' : j === i ? 'cur' : 'todo';
  const can = (k, j) => j === i || su.done.includes(k) || (j > 0 && su.done.includes(steps[j - 1][0]) && type);
  return `<div class="wz" style="--rc:${c}">
  <aside class="wz-side card pad stack">
    <div><div class="eyebrow">${t('Create an account')}</div><h3 style="font-size:22px;margin-top:4px">${type ? t('{r} account', { r: t(R(type).label) }) : t('Startup Fest account')}</h3></div>
    <div><div class="row between small"><span>${t('{n}% complete', { n: pct })}</span><span class="muted num">${su.done.length}/${steps.length - 1}</span></div><div class="bar rc" style="margin-top:6px"><i style="width:${pct}%"></i></div></div>
    <ol class="wz-steps">${steps.map(([k, l], j) => `<li><button type="button" class="wz-step ${state(k, j)}" data-act="wzgo" data-i="${j}" ${can(k, j) ? '' : 'disabled'} ${j === i ? 'aria-current="step"' : ''}><span class="ic">${state(k, j) === 'done' ? '✓' : j + 1}</span><span>${t(l)}</span></button></li>`).join('')}</ol>
    <p class="muted small" style="margin:0">${t('Your answers are saved as you go. Come back any time to finish.')}</p>
    <p class="small" style="margin:0">${t('Already have an account?')} <a href="#/login${type ? '/' + type : ''}" class="link">${t('Sign in')}</a></p>
  </aside>
  <section class="card pad wz-main stack">
    <div class="eyebrow">${t('Step {a} of {b}', { a: i + 1, b: steps.length })}</div>
    <h2 class="display" style="font-size:clamp(34px,4vw,48px)">${t(title)}</h2>
    <p class="muted" style="margin:0">${t(STEP_INFO[key], { r: type ? t(R(type).label) : '' })}</p>
    ${SF.ui.wzErr && Object.keys(SF.ui.wzErr).length ? `<div class="alert" role="alert">${t('Please fix the highlighted fields.')}</div>` : ''}
    <form id="su-form" data-step="${key}" class="stack" novalidate>${stepBody(key, type)}
      <div class="row between wz-nav">${i > 0 ? `<button type="button" class="btn ghost" data-act="wzback">${t('Back')}</button>` : '<span></span>'}
      <button class="cta" type="submit"><span class="btn">${key === 'review' ? t('Submit and create my ID') : t('Continue')}</span>${SF.ARROW}</button></div>
    </form>
  </section></div>`;
};

/* ---------- account settings ---------- */
V.account = () => { const a = SF.account(); if (!a) return V.login();
  return `${SF.back('#/me', t('My ID'))}${sh(t('Account settings'), `<span class="chip" style="background:${R(a.role).color};color:#fff">${t(R(a.role).label)}</span>`)}
  <div class="grid g2" style="align-items:start">
    <form id="acct-form" class="card pad stack"><b>${t('Login details')}</b>
      <div class="field"><label for="ac-name">${t('Contact name')}</label><input id="ac-name" value="${esc(a.contact)}"></div>
      <div class="field"><label for="ac-mail">${t('Email')}</label><input id="ac-mail" type="email" value="${esc(a.email)}"></div>
      <div class="row end"><button class="btn">${t('Save')}</button></div></form>
    <form id="pass-form" class="card pad stack"><b>${t('Change password')}</b>
      <div class="field"><label for="pw-old">${t('Current password')}</label><input id="pw-old" type="password" autocomplete="current-password"></div>
      <div class="field"><label for="pw-new">${t('New password')}</label><input id="pw-new" type="password" autocomplete="new-password" data-rules="1">${SF.pwList('')}</div>
      <div class="field"><label for="pw-new2">${t('Confirm password')}</label><input id="pw-new2" type="password" autocomplete="new-password"></div>
      <div class="row end"><button class="btn">${t('Change password')}</button></div></form>
  </div>
  <div class="card pad stack" style="margin-top:16px"><b>${t('Signed in')}</b><div class="list">
    <div class="it"><div class="grow"><div class="t">${t('This browser')}</div><div class="s">${t('Since {d}', { d: new Date(S().session.at).toLocaleString(SF.lang === 'en' ? 'en-GB' : SF.lang) })} · ${S().remember ? t('Kept signed in') : t('Signs out when the tab closes')}</div></div><button class="btn ghost sm" data-act="logout">${t('Log out')}</button></div></div></div>`; };

/* ---------- Office hours ---------- */
const mentors = () => [...SF.MENTORS, ...(S().mentorsNew || [])];
const taken = (m, s) => S().bookings.some(b => b.mentor === m && b.slot === s && b.status === 'Booked');
const stars = n => '★★★★★'.slice(0, Math.round(n)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(n));
const bkRow = (b, who) => `<div class="it"><span class="mini" style="background:${who === 'mentor' ? R('participant').color : R('mentor').color}">${SF.initials(who === 'mentor' ? b.by : b.mentor)}</span>
  <div class="grow"><div class="t">${esc(who === 'mentor' ? b.by + ' · ' + (b.team || '') : b.mentor)}</div><div class="s">${esc(dayLabel(b.slot))} · ${esc(b.topic)}</div>${b.notes ? `<div class="small" style="margin-top:4px">📝 ${esc(b.notes)}</div>` : ''}</div>
  ${b.status === 'Booked' ? (who === 'mentor' ? `<button class="btn sm" data-act="ohdone" data-id="${b.id}">${t('Mark done')}</button>` : `<button class="btn ghost sm" data-act="ohcancel" data-id="${b.id}">${t('Cancel')}</button>`)
    : b.status === 'Done' ? (who !== 'mentor' && !b.rating ? `<span class="row" style="gap:2px">${[1, 2, 3, 4, 5].map(n => `<button class="linkbtn star-btn" data-act="ohrate" data-id="${b.id}" data-n="${n}" aria-label="${t('{n} stars', { n })}">☆</button>`).join('')}</span>` : `<span class="chip ok">${b.rating ? stars(b.rating) : t('Done')}</span>`)
    : `<span class="chip">${t(b.status)}</span>`}</div>`;
const dayLabel = s => { const [d, h] = s.split(' '), x = SF.OH_DAYS.find(z => z[0] === d); return `${t(d)} ${x ? x[1] : ''} · ${h}`; };
V.hours = () => {
  const r = role(), me = SF.me(), name = r === 'mentor' ? me.name : SF.myName();
  if (r === 'mentor') { const av = S().avail[name] = S().avail[name] || [], mine = S().bookings.filter(b => b.mentor === name), up = mine.filter(b => b.status === 'Booked'), done = mine.filter(b => b.status === 'Done');
    const rated = done.filter(b => b.rating), avg = rated.length ? (rated.reduce((a, b) => a + b.rating, 0) / rated.length).toFixed(1) : '–';
    return `${sh(t('My office hours'), `<span class="muted">${t('Week of {d}', { d: '3 Nov' })}</span>`)}
    <div class="kpis"><div class="kpi red"><b class="num">${up.length}</b><span>${t('sessions booked')}</span></div><div class="kpi black"><b class="num">${av.length}</b><span>${t('slots open')}</span></div><div class="kpi"><b class="num">${(SF.MENTORS.find(m => m.n === name) || { hours: 0 }).hours + done.length}</b><span>${t('hours given this season')}</span></div><div class="kpi"><b class="num">${avg}</b><span>${t('average rating')}</span></div></div>
    ${sh(t('Availability'), `<span class="muted">${t('Tap a slot to open or close it')}</span>`)}
    <div class="card pad tablewrap"><table class="oh-grid"><thead><tr><th></th>${SF.OH_DAYS.map(([d, dt]) => `<th>${t(d)}<div class="muted small">${dt}</div></th>`).join('')}</tr></thead><tbody>
    ${SF.OH_TIMES.map(h => `<tr><th class="num">${h}</th>${SF.OH_DAYS.map(([d]) => { const k = d + ' ' + h, b = S().bookings.find(x => x.mentor === name && x.slot === k && x.status === 'Booked');
      return `<td>${b ? `<span class="oh-cell booked" title="${esc(b.topic)}">${esc(b.by.split(' ')[0])}</span>` : `<button class="oh-cell ${av.includes(k) ? 'open' : ''}" data-act="ohslot" data-k="${k}" aria-pressed="${av.includes(k)}">${av.includes(k) ? t('Open') : '–'}</button>`}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>
    ${sh(t('Upcoming sessions'))}<div class="card pad"><div class="list">${up.map(b => bkRow(b, 'mentor')).join('') || `<span class="muted">${t('No sessions booked yet. Open more slots.')}</span>`}</div></div>
    ${done.length ? `${sh(t('Past sessions'))}<div class="card pad"><div class="list">${done.map(b => bkRow(b, 'mentor')).join('')}</div></div>` : ''}`; }
  if (r === 'org') { const all = S().bookings;
    return `${sh(t('Office hours across the community'))}
    <div class="kpis"><div class="kpi red"><b class="num">${all.filter(b => b.status === 'Booked').length}</b><span>${t('sessions booked')}</span></div><div class="kpi black"><b class="num">${all.filter(b => b.status === 'Done').length}</b><span>${t('sessions done')}</span></div><div class="kpi"><b class="num">${mentors().length}</b><span>${t('mentors with office hours')}</span></div><div class="kpi"><b class="num">${Object.values(S().avail).reduce((a, l) => a + l.length, 0)}</b><span>${t('slots open')}</span></div></div>
    <div class="card tablewrap" style="margin-top:16px"><table><thead><tr><th>${t('Mentor')}</th><th>${t('Founder')}</th><th>${t('When')}</th><th>${t('Topic')}</th><th>${t('Status')}</th></tr></thead><tbody>
    ${all.map(b => `<tr><td><b>${esc(b.mentor)}</b></td><td>${esc(b.by)}</td><td class="num">${esc(dayLabel(b.slot))}</td><td>${esc(b.topic)}</td><td><span class="chip ${b.status === 'Done' ? 'ok' : b.status === 'Booked' ? 'red' : ''}">${t(b.status)}</span></td></tr>`).join('')}</tbody></table></div>`; }
  const f = S().filters.ohexp || 'All', mine = S().bookings.filter(b => b.by === name);
  const list = mentors().filter(m => f === 'All' || m.exp === f);
  return `${sh(t('Book a mentor'), `<a class="btn ghost sm" href="#/peers">${t('Peer groups')}</a>`)}
  <p class="muted" style="margin:-6px 0 14px">${t('Free 30-minute office hours with people who run real businesses. Bring one question.')}</p>
  ${mine.length ? `<div class="card pad" style="margin-bottom:16px"><div class="eyebrow">${t('My sessions')}</div><div class="list" style="margin-top:6px">${mine.map(b => bkRow(b, 'founder')).join('')}</div></div>` : ''}
  <div class="filters">${['All', ...new Set(mentors().map(m => m.exp))].map(x => `<button class="chip ${f === x ? 'red' : ''}" data-act="filter" data-k="ohexp" data-v="${esc(x)}">${t(x)}</button>`).join('')}</div>
  <div class="grid g2">${list.map(m => { const free = (S().avail[m.n] || []).filter(s => !taken(m.n, s));
    return `<div class="card pad stack" style="gap:10px"><div class="row" style="gap:12px"><span class="avatar sm" style="background:${R('mentor').color}">${SF.initials(m.n)}</span><div class="grow"><b style="font-size:17px">${esc(m.n)}</b><div class="muted small">${t(m.exp)} · ${esc(m.co)} · ${t(m.region)}</div></div>
      <div class="center"><div style="color:#e8a400">${stars(m.rating)}</div><div class="muted small num">${m.rating} · ${t('{n} h', { n: m.hours })}</div></div></div>
      <div class="row" style="gap:6px">${(m.topics || []).map(x => `<span class="chip">${t(x)}</span>`).join('')}<span class="muted small">${esc(m.langs)}</span></div>
      <div><div class="eyebrow" style="margin-bottom:6px">${t('Free slots next week')}</div><div class="row" style="gap:6px">${free.map(s => `<button class="btn ghost sm" data-act="book" data-m="${esc(m.n)}" data-s="${s}">${esc(dayLabel(s))}</button>`).join('') || `<span class="muted small">${t('Fully booked. Check back on Monday.')}</span>`}</div></div></div>`; }).join('')}</div>`;
};

/* ---------- Judging ---------- */
SF.teamsFor = ev => SF.TEAMS.filter(x => x.r === SF.JUDGING.find(j => j.id === ev).region);
SF.leader = ev => { const sc = S().scores[ev] || {}, judges = Object.keys(sc);
  return SF.teamsFor(ev).map(tm => { const got = judges.filter(j => sc[j][tm.n]).map(j => sc[j][tm.n]);
    const avg = got.length ? Math.round(got.reduce((a, s) => a + SF.weighted(s), 0) / got.length) : 0;
    const per = Object.fromEntries(SF.CRITERIA.map(([k]) => [k, got.length ? (got.reduce((a, s) => a + (+s[k] || 0), 0) / got.length).toFixed(1) : '–']));
    return { ...tm, avg, cnt: got.length, per }; }).sort((a, b) => b.avg - a.avg); };
const board = ev => { const L = SF.leader(ev), j = SF.JUDGING.find(x => x.id === ev);
  return `<div class="card tablewrap"><table><thead><tr><th>#</th><th>${t('Team')}</th><th>${t('Track')}</th>${SF.CRITERIA.map(([, n, w]) => `<th title="${t(n)}">${t(n).split(' ')[0]} <span class="muted">${w}%</span></th>`).join('')}<th>${t('Judges')}</th><th>${t('Score')}</th></tr></thead><tbody>
  ${L.map((x, i) => `<tr><td class="num">${i + 1}</td><td><b>${esc(x.n)}</b></td><td>${t(x.tr)}</td>${SF.CRITERIA.map(([k]) => `<td class="num">${x.per[k]}</td>`).join('')}<td class="num">${x.cnt}/${j.judges.length}</td><td><b class="num" style="font-size:20px;color:var(--brand)">${x.avg || '–'}</b></td></tr>`).join('')}</tbody></table></div>`; };
V.judge = () => {
  const r = role(), me = SF.me().name, evs = r === 'org' ? SF.JUDGING : SF.JUDGING.filter(j => j.judges.includes(me));
  if (!evs.length) return `${sh(t('Judging'))}<div class="card pad stack"><b>${t('You are not on a jury yet')}</b><span class="muted">${t('The org team assigns judges for each regional stage. Tell them you are free.')}</span><button class="btn" style="align-self:start" data-act="volunteer">${t('Volunteer to judge')}</button></div>`;
  const ev = evs.find(j => j.id === S().filters.jev) ? S().filters.jev : evs[0].id, J = SF.JUDGING.find(j => j.id === ev), locked = S().locked[ev];
  const tabs = `<div class="filters">${evs.map(j => `<button class="chip ${j.id === ev ? 'red' : ''}" data-act="filter" data-k="jev" data-v="${j.id}">${t(j.title)} · ${j.date}</button>`).join('')}</div>`;
  const live = `<span class="chip live">● ${t(locked ? 'Final' : 'Live')}</span>`;
  if (r === 'org') { const sc = S().scores[ev] || {};
    return `${sh(t('Judging'), live)}${tabs}
    <div class="grid g3">${J.judges.map(n => `<div class="card pad row"><span class="mini" style="background:${R('mentor').color}">${SF.initials(n)}</span><div class="grow"><b>${esc(n)}</b><div class="muted small">${sc[n] ? t('{a} of {b} teams scored', { a: Object.keys(sc[n]).length, b: SF.teamsFor(ev).length }) : t('Not started')}</div></div>${sc[n] && Object.keys(sc[n]).length === SF.teamsFor(ev).length ? `<span class="chip ok">${t('Done')}</span>` : `<button class="btn ghost sm" data-act="nudge" data-n="${esc(n)}">${t('Remind')}</button>`}</div>`).join('')}</div>
    ${sh(t('Leaderboard'))}${board(ev)}
    <div class="card pad row between" style="margin-top:16px"><div><b>${locked ? t('Results are locked') : t('Lock results and pick finalists')}</b><div class="muted small">${t('The top team in each track goes to the National Final.')}</div></div>${locked ? `<a class="btn ghost" href="#/season">${t('See the season')}</a>` : `<button class="btn" data-act="lockres" data-ev="${ev}">${t('Lock results')}</button>`}</div>`; }
  const mine = (S().scores[ev] || {})[me], draft = S().judgeDraft[ev] = S().judgeDraft[ev] || JSON.parse(JSON.stringify(mine || {})), editing = !mine || S().filters.jedit === ev;
  return `${sh(t('My scorecards'), live)}${tabs}
  <p class="muted" style="margin:12px 0 14px">${t('Score each team from 1 to 10. Weights are fixed for every region, so results are comparable.')}</p>
  <div class="grid g2">${SF.teamsFor(ev).map(tm => { const s = draft[tm.n] || {};
    return `<div class="card pad stack score-card"><div class="row between"><div><b style="font-size:18px">${esc(tm.n)}</b><div class="muted small">${t(tm.tr)}</div></div><b class="display num" style="font-size:40px;color:var(--brand)">${SF.weighted(s) || '<span class="muted" style="font-size:22px">' + t('Not started') + '</span>'}</b></div>
    ${SF.CRITERIA.map(([k, n, w]) => `<div class="score-row"><label for="sc-${SF.slug(tm.n)}-${k}">${t(n)} <span class="muted">${w}%</span></label><select id="sc-${SF.slug(tm.n)}-${k}" data-score="1" data-ev="${ev}" data-team="${esc(tm.n)}" data-k="${k}" ${editing && !locked ? '' : 'disabled'}><option value="">–</option>${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<option ${+s[k] === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>`).join('')}
    </div>`; }).join('')}</div>
  <div class="card pad row between" style="margin-top:16px">${locked ? `<b>${t('Results are locked')}</b>` : editing ? `<div><b>${t('Submit when every team has all five scores')}</b><div class="muted small">${t('You can edit until the org team locks the results.')}</div></div><button class="btn" data-act="submitscores" data-ev="${ev}">${t('Submit my scores')}</button>`
    : `<div><span class="chip ok">${t('Submitted')}</span></div><button class="btn ghost" data-act="filter" data-k="jedit" data-v="${ev}">${t('Edit scores')}</button>`}</div>
  ${sh(t('Leaderboard'), `<span class="muted">${t('Average of submitted scorecards')}</span>`)}${board(ev)}`;
};

/* ---------- Peer groups ---------- */
SF.peerMembers = g => [...g.members, ...(S().peer.joined[g.id] || [])];
SF.myPeer = () => SF.PEER_GROUPS.find(g => (S().peer.joined[g.id] || []).includes(SF.myName()));
V.peers = () => {
  const r = role(), me = SF.myName(), my = SF.myPeer(), modOf = SF.PEER_GROUPS.filter(g => g.mod === SF.me().name);
  const free = SF.me().points >= 1000 || Object.values(S().finalists).includes(SF.me().fields.team);
  const detail = g => `<div class="card pad stack"><div class="row between"><div><div class="eyebrow">${t(g.mod === SF.me().name ? 'You moderate' : 'My peer group')}</div><b style="font-size:20px">${t(g.name)}</b></div><span class="chip red">${t('Next: {d}', { d: g.next })}</span></div>
    <div class="muted small">${t(g.when)} · ${t('Moderator')}: ${esc(g.mod)}</div>
    <div class="row" style="gap:6px">${SF.peerMembers(g).map(n => `<span class="chip"><span class="mini xs" style="background:${R('participant').color}">${SF.initials(n)}</span>${esc(n)}</span>`).join('')}</div>
    <div class="eyebrow">${t('Session notes')}</div><div class="list">${(S().peer.notes[g.id] || []).map(n => `<div class="it"><div class="grow"><div class="t">${esc(n.by)} · <span class="muted">${esc(n.d)}</span></div><div class="s">${esc(n.t)}</div></div></div>`).join('') || `<span class="muted small">${t('No notes yet.')}</span>`}</div>
    <form id="peernote-form" data-g="${g.id}" class="row" style="align-items:flex-end"><div class="field grow"><label for="pn-t">${t('Add a note or a goal for next time')}</label><input id="pn-t" required></div><button class="btn">${t('Add')}</button></form>
    ${g.mod !== SF.me().name ? `<button class="linkbtn" style="align-self:start" data-act="peerleave" data-g="${g.id}">${t('Leave the group')}</button>` : ''}</div>`;
  return `<section class="panel black" style="position:relative;overflow:hidden;margin-bottom:20px"><div style="position:absolute;right:-40px;top:-40px;opacity:.18">${SF.STAR(280, '#e01a09')}</div>
    <div class="eyebrow" style="color:#fff;opacity:.7">${t('Paid tier')}</div><h1 class="display" style="font-size:clamp(40px,5vw,68px);margin-top:8px">${t('PEER GROUPS OF 8')}</h1>
    <p style="max-width:52ch;font-size:18px;font-weight:300">${t('Eight founders at the same stage meet once a month with a moderator. Same people all year, so you can be honest about numbers.')}</p>
    <div class="row"><span class="chip money">${t('{p} a month', { p: SF.uzs(SF.PEER_PRICE) })}</span><span class="chip" style="background:#fff2">${t('Free for Champions and regional finalists')}</span></div></section>
  ${modOf.map(detail).join('')}${my ? detail(my) : ''}
  ${r === 'org' ? `<div class="kpis" style="margin:16px 0"><div class="kpi red"><b class="num">${SF.PEER_GROUPS.reduce((a, g) => a + SF.peerMembers(g).length, 0)}</b><span>${t('members in groups')}</span></div><div class="kpi black"><b class="num">${SF.uzs(SF.PEER_GROUPS.reduce((a, g) => a + SF.peerMembers(g).length, 0) * SF.PEER_PRICE)}</b><span>${t('monthly revenue')}</span></div><div class="kpi"><b class="num">${Object.values(S().peer.waitlist).reduce((a, l) => a + l.length, 0)}</b><span>${t('on waiting lists')}</span></div><div class="kpi"><b class="num">${SF.PEER_GROUPS.length}</b><span>${t('groups')}</span></div></div>` : ''}
  ${sh(t('Groups'), `<span class="muted">${t('Max 8 members each')}</span>`)}
  <div class="grid g3">${SF.PEER_GROUPS.map(g => { const n = SF.peerMembers(g).length, full = n >= 8, inIt = my && my.id === g.id, wait = (S().peer.waitlist[g.id] || []).includes(me);
    return `<div class="card pad stack" style="gap:10px"><span class="chip" style="align-self:start">${t(g.guild)}</span><b style="font-size:18px">${t(g.name)}</b><div class="muted small">${t(g.when)}</div><div class="muted small">${t('Moderator')}: ${esc(g.mod)}</div>
    <div><div class="row between small"><span>${t('{n} of 8 seats', { n })}</span><span class="muted">${full ? t('Full') : t('{n} left', { n: 8 - n })}</span></div><div class="bar" style="margin-top:6px"><i style="width:${n / 8 * 100}%"></i></div></div>
    ${['participant', 'sme'].includes(r) ? (inIt ? `<span class="chip ok" style="align-self:start">${t('You are a member')}</span>` : my ? '' : full ? (wait ? `<span class="chip warn" style="align-self:start">${t('On the waiting list')}</span>` : `<button class="btn ghost sm" style="align-self:start" data-act="peerwait" data-g="${g.id}">${t('Join the waiting list')}</button>`)
      : `<button class="btn sm" style="align-self:start" data-act="peerjoin" data-g="${g.id}">${free ? t('Join for free') : t('Join · {p}/month', { p: SF.uzs(SF.PEER_PRICE) })}</button>`) : ''}</div>`; }).join('')}</div>`;
};

/* ---------- Recognition: Champions and Fellows ---------- */
V.fellows = () => {
  const r = role(), me = SF.me(), name = SF.myName(), mine = S().recog.filter(x => x.name === name || x.name === me.name), lv = SF.level(me.points);
  const queue = S().recog.filter(x => /Submitted/.test(x.status)), approved = S().recog.filter(x => x.status === 'Approved');
  const card = c => { const ok = me.points >= c.min, rec = mine.find(x => x.level === c.k);
    return `<div class="card pad stack" style="gap:10px"><div class="row between"><b class="display" style="font-size:36px">${t(c.k).toUpperCase()}</b>${r === 'org' ? '' : `<span class="chip ${ok ? 'ok' : ''}">${ok ? t('You qualify') : t('{n} more points', { n: SF.fmt(c.min - me.points) })}</span>`}</div>
    <div class="eyebrow">${t('What you need')}</div><div class="list">${c.needs.map((x, i) => `<div class="it"><span>${i === 0 ? (ok ? '✓' : '○') : '•'}</span><div class="grow">${t(x)}</div></div>`).join('')}</div>
    <div class="eyebrow">${t('What you get')}</div><div class="row" style="gap:6px">${c.perks.map(x => `<span class="chip red">${t(x)}</span>`).join('')}</div>
    ${r === 'org' ? '' : rec ? `<span class="chip ${rec.status === 'Approved' ? 'ok' : 'warn'}" style="align-self:start">${t(rec.status)}${rec.renews ? ' · ' + t('renews {d}', { d: rec.renews }) : ''}</span>${rec.status === 'Approved' && /2026/.test(rec.renews) ? `<button class="btn sm" style="align-self:start" data-act="renew" data-id="${rec.id}">${t('Renew for 2027')}</button>` : ''}`
      : `<button class="btn ${ok ? '' : 'ghost'} sm" style="align-self:start" data-act="recogapply" data-l="${c.k}">${t('Apply to be a {l}', { l: t(c.k) })}</button>`}</div>`; };
  return `${sh(t('Champions and Fellows'), `<span class="muted">${t('Recognition is yearly. Renew by showing what you did.')}</span>`)}
  ${r === 'org' ? '' : `<div class="card pad"><div class="ladder">${SF.LEVELS.map(([n, p]) => `<div class="rung ${lv.cur[0] === n ? 'on' : me.points >= p ? 'past' : ''}"><b>${t(n)}</b><span class="num">${SF.fmt(p)}</span></div>`).join('')}</div>
  <div class="muted small" style="margin-top:8px">${t('You have {p} points. Points come from events, applications, gigs, office hours and judging.', { p: SF.fmt(me.points) })}</div></div>`}
  <div class="grid g2" style="margin-top:16px">${SF.RECOG.map(card).join('')}</div>
  ${r === 'org' ? `${sh(t('Applications to review'), `<span class="chip red">${queue.length}</span>`)}<div class="card tablewrap"><table><thead><tr><th>${t('Name')}</th><th>${t('Member type')}</th><th>${t('Level')}</th><th>${t('What they did')}</th><th></th></tr></thead><tbody>
    ${queue.map(x => `<tr><td><b>${esc(x.name)}</b></td><td>${t(R(x.role).label)}</td><td>${t(x.level)}${/Renewal/.test(x.status) ? ' · ' + t('renewal') : ''}</td><td>${esc(x.story)}</td><td class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn sm" data-act="recogok" data-id="${x.id}">${t('Approve')}</button><button class="btn ghost sm" data-act="recogno" data-id="${x.id}">${t('Decline')}</button></td></tr>`).join('') || `<tr><td colspan="5" class="muted">${t('Nothing to review')}</td></tr>`}</tbody></table></div>` : ''}
  ${sh(t('Hall of Champions'))}<div class="grid g4">${approved.map(x => `<div class="card pad stack center" style="align-items:center;gap:6px"><span class="avatar sm" style="background:${R(x.role).color}">${SF.initials(x.name)}</span><b>${esc(x.name)}</b><span class="chip red">★ ${t(x.level)}</span><span class="muted small">${t('since {d}', { d: x.since })}</span></div>`).join('')}</div>`;
};

/* ---------- home: a "for you" strip with the new programmes ---------- */
const home5 = V.home;
V.home = () => { const h = home5(), r = role(), me = SF.myName();
  const next = S().bookings.find(b => b.by === me && b.status === 'Booked');
  const tiles = {
    participant: [[next ? '#/hours' : '#/hours', next ? t('Office hours: {d}', { d: dayLabel(next.slot) }) : t('Book a mentor'), next ? esc(next.mentor) : t('Free 30-minute sessions')], ['#/peers', t('Peer groups of 8'), t('{p} a month', { p: SF.uzs(SF.PEER_PRICE) })], ['#/fellows', t('Become a Champion'), t('{n} more points', { n: SF.fmt(Math.max(0, 1000 - SF.me().points)) })]],
    mentor: [['#/hours', t('{n} sessions booked', { n: S().bookings.filter(b => b.mentor === SF.me().name && b.status === 'Booked').length }), t('My office hours')], ['#/judge', t('Score the Samarkand teams'), t('Regional stage · 20 Nov')], ['#/fellows', t('Champion renewal due'), t('renews {d}', { d: 'Nov 2026' })]],
    org: [['#/judge', t('Judging'), t('{n} scorecards in', { n: Object.values(S().scores).reduce((a, x) => a + Object.keys(x).length, 0) })], ['#/fellows', t('Applications to review'), String(S().recog.filter(x => /Submitted/.test(x.status)).length)], ['#/peers', t('Peer groups'), t('{n} members', { n: SF.PEER_GROUPS.reduce((a, g) => a + SF.peerMembers(g).length, 0) })]],
    sme: [['#/earn', t('Post a task for student builders'), t('Paid by the task')], ['#/hours', t('Ask a mentor'), t('Marketing, pricing, legal')], ['#/plans', t('SME access'), t('Startups that fit small shops')]],
    scout: [['#/directory', t('Pick startups'), t('Only those who agreed to be recommended')], ['#/plans', t('Your retainer'), t('A shortlist every month')], ['#/events/e5', t('VC Battle'), '12 Dec']],
  }[r];
  if (!tiles) return h;
  const strip = `<div class="foryou">${tiles.map(([href, a, b], i) => `<a class="fy ${i === 0 ? 'red' : ''}" href="${href}"><b>${a}</b><span>${b}</span>${SF.ARROW}</a>`).join('')}</div>`;
  const i = h.indexOf('<div class="kpis">'); return i >= 0 ? h.slice(0, i) + strip + h.slice(i) : strip + h; };

/* ---------- My ID: account and recognition links ---------- */
const me5 = V.me;
V.me = () => me5().replace(`<button class="btn" data-act="join">${t('Get a Startup Fest ID')}</button>`, `<div class="row"><a class="btn ghost" href="#/fellows">${t('Champions and Fellows')}</a><a class="btn" href="#/account">${t('Account settings')}</a></div>`)
  .replace(`<b>${t('New here?')}</b><div class="muted">${t('Create your own ID to see the sign-up flow.')}</div>`, `<b>${t('Your account')}</b><div class="muted">${esc((SF.account() || {}).email || '')}</div>`);

/* ---------- org dashboard: programme health ---------- */
const adm5 = V.admin;
V.admin = () => { const h = adm5(), q = S().recog.filter(x => /Submitted/.test(x.status)).length;
  const cards = [['#/hours', 'Office hours', t('{a} booked · {b} done', { a: S().bookings.filter(b => b.status === 'Booked').length, b: S().bookings.filter(b => b.status === 'Done').length })],
    ['#/judge', 'Judging', t('{n} scorecards in', { n: Object.values(S().scores).reduce((a, x) => a + Object.keys(x).length, 0) })],
    ['#/peers', 'Peer groups', t('{n} members', { n: SF.PEER_GROUPS.reduce((a, g) => a + SF.peerMembers(g).length, 0) })], ['#/fellows', 'Champions and Fellows', t('{n} to review', { n: q })]];
  const i = h.indexOf('<div class="sec-h"><h2>' + t('Regions'));
  const block = `${sh(t('Programmes'))}<div class="grid g4">${cards.map(([href, a, b]) => `<a class="card pad tile" href="${href}"><b style="font-size:20px">${t(a)}</b><span class="muted">${b}</span></a>`).join('')}</div>`;
  return i >= 0 ? h.slice(0, i) + block + h.slice(i) : h + block; };
})();
