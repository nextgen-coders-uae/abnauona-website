'use strict';
/**
 * Template helpers — every page template receives a `ctx` object built here.
 * Nothing in the templates hard-codes text: all copy comes from src/i18n/*.json
 * through ctx.t() / ctx.raw(), and all numbers/dates from src/data/site.json.
 */

const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC_MAP[c]);

/** Build an HTML attribute string from an object (false/null values are skipped). */
const attrs = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== false && v != null)
    .map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`))
    .join(' ');

const lookup = (dict, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);

const interpolate = (str, vars = {}) =>
  String(str).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));

const fmtNumber = (n) => Number(n).toLocaleString('en-US');

/**
 * @param {object} opts
 * @param {string} opts.lang         'ar' | 'en'
 * @param {object} opts.dict         parsed i18n file for this language
 * @param {object} opts.data         parsed site.json
 * @param {object} opts.page         current page definition (see pages/index.js)
 * @param {Array}  opts.pages        all page definitions
 * @param {Function} opts.assetUrl   maps "css/main.css" -> "/assets/css/main.css?v=hash"
 * @param {Set}    opts.missing      collects missing translation keys (reported by the build)
 */
function createContext({ lang, dict, data, page, pages, assetUrl, missing }) {
  const otherLang = data.site.languages.find((l) => l !== lang);
  const pageById = Object.fromEntries(pages.map((p) => [p.id, p]));

  const raw = (key) => {
    const v = lookup(dict, key);
    if (v === undefined) missing.add(`${lang}:${key}`);
    return v;
  };

  /** Escaped, interpolated translation — safe to drop into HTML. */
  const t = (key, vars) => {
    const v = raw(key);
    return v === undefined ? esc(key) : esc(interpolate(v, vars));
  };

  const url = (id, l = lang) => {
    const p = pageById[id];
    if (!p) throw new Error(`Unknown page id "${id}"`);
    return `/${l}/${p.path}`;
  };
  const abs = (path) => data.site.url.replace(/\/$/, '') + path;

  const icon = (name, cls = '') =>
    `<svg class="icon${cls ? ' ' + cls : ''}" aria-hidden="true" focusable="false"><use href="${assetUrl('icons/sprite.svg')}#i-${name}"></use></svg>`;

  /** Responsive <img> for an entry of site.json → images. */
  const img = (name, { alt = '', sizes = '100vw', cls = '', eager = false, maxWidth } = {}) => {
    const im = data.images[name];
    if (!im) throw new Error(`Unknown image "${name}"`);
    const widths = maxWidth ? im.widths.filter((w) => w <= maxWidth) : im.widths;
    const list = widths.length ? widths : [im.widths[0]];
    const src = (w) => `/assets/img/${im.dir}/${name}-${w}.webp`;
    const fallback = list[Math.min(1, list.length - 1)];
    return `<img ${attrs({
      src: src(fallback),
      srcset: list.map((w) => `${src(w)} ${w}w`).join(', '),
      sizes,
      width: im.w,
      height: im.h,
      alt,
      class: cls || null,
      loading: eager ? 'eager' : 'lazy',
      fetchpriority: eager ? 'high' : null,
      decoding: 'async',
    })}>`;
  };
  const imgLarge = (name) => {
    const im = data.images[name];
    return `/assets/img/${im.dir}/${name}-${im.widths[im.widths.length - 1]}.webp`;
  };

  const intlDate = (iso, opts) =>
    new Intl.DateTimeFormat(dict.meta.intl, { timeZone: 'UTC', ...opts }).format(new Date(`${iso}T00:00:00Z`));

  const currency = dict.common.currency;
  const money = (n) => (lang === 'ar' ? `${fmtNumber(n)} ${currency}` : `${currency} ${fmtNumber(n)}`);
  const moneyHtml = (n) => {
    const num = `<span class="amt">${fmtNumber(n)}</span>`;
    const cur = `<span class="cur">${esc(currency)}</span>`;
    return lang === 'ar' ? `${num} ${cur}` : `${cur} ${num}`;
  };

  return {
    lang,
    otherLang,
    dir: dict.meta.dir,
    dict,
    data,
    page,
    pages,
    esc,
    attrs,
    t,
    raw,
    url,
    abs,
    asset: assetUrl,
    icon,
    img,
    imgLarge,
    num: fmtNumber,
    money,
    moneyHtml,
    date: (iso) => intlDate(iso, { day: 'numeric', month: 'long', year: 'numeric' }),
    dateParts: (iso) => ({
      weekday: intlDate(iso, { weekday: 'long' }),
      day: intlDate(iso, { day: 'numeric' }),
      month: intlDate(iso, { month: 'long' }),
      year: intlDate(iso, { year: 'numeric' }),
    }),
    year: new Date().getFullYear(),
  };
}

module.exports = { esc, attrs, interpolate, fmtNumber, createContext };
