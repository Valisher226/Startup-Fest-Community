// Translation helper. v2 ships English only; v3 adds Uzbek and Russian dictionaries.
window.SF = window.SF || {};
SF.DICT = SF.DICT || { en: {} };
SF.LANGS = SF.LANGS || [['en', 'EN']];
SF.lang = 'en';
// t('Hello {name}', {name}) — the English text is the key; missing translations fall back to English
SF.t = (s, vars) => {
  let out = (SF.DICT[SF.lang] && SF.DICT[SF.lang][s]) || s;
  if (vars) out = out.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
  return out;
};
