#!/usr/bin/env node
'use strict';
/**
 * Abnauona static site generator — zero dependencies (Node 18+).
 *
 *   node scripts/build.js           → builds everything into /dist
 *
 * Reads:  src/data/site.json, src/i18n/{ar,en}.json, src/templates/**, src/assets/**, src/static/**
 * Writes: dist/{ar,en}/<page>/index.html, dist/index.html (language redirect), 404 pages,
 *         sitemap.xml, robots.txt, manifest.webmanifest, .ics calendar files, Netlify _headers/_redirects.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const { createContext } = require(path.join(SRC, 'templates', 'helpers'));
const { layout } = require(path.join(SRC, 'templates', 'layout'));
const { patternSvg, placeholderSvg } = require(path.join(SRC, 'templates', 'ornaments'));
const PAGES = require(path.join(SRC, 'templates', 'pages'));

const started = Date.now();

/* ------------------------------------------------------------------ utils */
function readJson(file) {
  const text = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(text);
  } catch (err) {
    const pos = Number((err.message.match(/position (\d+)/) || [])[1]);
    const line = Number.isFinite(pos) ? text.slice(0, pos).split('\n').length : '?';
    throw new Error(`Invalid JSON in ${path.relative(ROOT, file)} (around line ${line}): ${err.message}`);
  }
}

function write(rel, content) {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

const hash = (content) => crypto.createHash('md5').update(content).digest('hex').slice(0, 10);

/** Conservative CSS minifier (comments + whitespace only). */
const minifyCss = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();

/** Flatten nested keys to compare the two translation files. */
function keysOf(obj, prefix = '') {
  if (obj === null || typeof obj !== 'object') return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keysOf(v, prefix ? `${prefix}.${k}` : k));
}

/* ------------------------------------------------------------------ load */
const data = readJson(path.join(SRC, 'data', 'site.json'));
const dicts = Object.fromEntries(data.site.languages.map((l) => [l, readJson(path.join(SRC, 'i18n', `${l}.json`))]));
const SITE = data.site.url.replace(/\/$/, '');
const warnings = [];

{
  const [a, b] = data.site.languages;
  const ka = new Set(keysOf(dicts[a]));
  const kb = new Set(keysOf(dicts[b]));
  for (const k of ka) if (!kb.has(k)) warnings.push(`i18n: "${k}" exists in ${a}.json but not in ${b}.json`);
  for (const k of kb) if (!ka.has(k)) warnings.push(`i18n: "${k}" exists in ${b}.json but not in ${a}.json`);
}

/* ------------------------------------------------------------------ assets */
fs.rmSync(DIST, { recursive: true, force: true });
copyDir(path.join(SRC, 'assets'), path.join(DIST, 'assets'));
copyDir(path.join(SRC, 'static'), DIST);

const versions = {};
for (const rel of ['css/main.css', ...fs.readdirSync(path.join(SRC, 'assets', 'js')).map((f) => `js/${f}`), 'icons/sprite.svg']) {
  const file = path.join(DIST, 'assets', rel);
  let content = fs.readFileSync(file, 'utf8');
  if (rel.endsWith('.css')) {
    content = minifyCss(content);
    fs.writeFileSync(file, content);
  }
  versions[rel] = hash(content);
}
const assetUrl = (rel) => `/assets/${rel}${versions[rel] ? `?v=${versions[rel]}` : ''}`;

// Hieroglyph background tiles (light sections / dark sections)
write('assets/img/pattern-glyphs.svg', patternSvg('#7A4A2E', 0.09));
write('assets/img/pattern-glyphs-light.svg', patternSvg('#E3B54A', 0.1));

// Illustrated placeholders for gallery items without a real photo yet
const sprite = fs.readFileSync(path.join(SRC, 'assets', 'icons', 'sprite.svg'), 'utf8');
const symbols = {};
for (const m of sprite.matchAll(/<symbol id="i-([\w-]+)"([^>]*)>([\s\S]*?)<\/symbol>/g)) {
  symbols[m[1]] = { attrs: m[2].trim(), inner: m[3] };
}
for (const g of data.gallery.filter((x) => x.placeholder)) {
  const sym = symbols[g.placeholder.icon];
  if (!sym) throw new Error(`Gallery placeholder "${g.id}" uses unknown icon "${g.placeholder.icon}"`);
  write(`assets/img/placeholders/${g.id}.svg`, placeholderSvg(sym, g.placeholder.tone));
}

/* ------------------------------------------------------------------ pages */
const missing = new Set();
let pageCount = 0;

for (const lang of data.site.languages) {
  const dict = dicts[lang];
  const otherDict = dicts[data.site.languages.find((l) => l !== lang)];
  for (const page of PAGES) {
    const ctx = createContext({ lang, dict, data, page, pages: PAGES, assetUrl, missing });
    ctx.otherDict = otherDict;
    const out = page.render(ctx);
    const html = layout(ctx, out);
    const rel = page.file ? `${lang}/${page.path}` : `${lang}/${page.path}index.html`;
    write(rel, html);
    pageCount++;
  }
}

/* ------------------------------------------------------------------ root files */
const defaultLang = data.site.defaultLang;

// "/" → remembered language (localStorage) or the default (Arabic)
write('index.html', `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${dicts.ar.meta.siteName} | ${dicts.en.meta.siteName}</title>
<meta name="description" content="${dicts.ar.pages.home.description}">
<link rel="canonical" href="${SITE}/${defaultLang}/">
<link rel="alternate" hreflang="ar" href="${SITE}/ar/">
<link rel="alternate" hreflang="en" href="${SITE}/en/">
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<meta property="og:title" content="${dicts.ar.pages.home.title}">
<meta property="og:description" content="${dicts.ar.pages.home.description}">
<meta property="og:image" content="${SITE}/assets/img/brand/og-image.jpg">
<meta property="og:url" content="${SITE}/">
<meta name="theme-color" content="${data.site.themeColor}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<script>(function(){var l;try{l=localStorage.getItem('abn-lang')}catch(e){}if(l!=='ar'&&l!=='en')l='${defaultLang}';location.replace('/'+l+'/'+location.search+location.hash)})()</script>
<noscript><meta http-equiv="refresh" content="0; url=/${defaultLang}/"></noscript>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#261A55;color:#F5ECD7;font-family:system-ui,sans-serif;text-align:center}a{color:#E3B54A;margin:0 .75rem;font-size:1.1rem}</style>
</head>
<body>
<main>
<img src="/assets/img/brand/logo-mark-gold-192.webp" width="72" height="96" alt="">
<p><a href="/ar/" hreflang="ar">العربية</a> | <a href="/en/" hreflang="en" lang="en">English</a></p>
</main>
</body>
</html>`);

// Generic 404 (hosts that only support a root 404.html, e.g. Vercel) → language-aware copy
const ar404 = fs.readFileSync(path.join(DIST, 'ar', '404.html'), 'utf8');
write('404.html', ar404.replace('<head>', `<head>\n<script>if(/^\\/en(\\/|$)/.test(location.pathname))location.replace('/en/404.html')</script>`));

// Sitemap with hreflang alternates
const today = new Date().toISOString().slice(0, 10);
const urlFor = (lang, p) => `${SITE}/${lang}/${p.path}`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${PAGES.filter((p) => !p.noindex)
  .flatMap((p) => data.site.languages.map((lang) => `  <url>
    <loc>${urlFor(lang, p)}</loc>
${data.site.languages.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(l, p)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(defaultLang, p)}"/>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq || 'monthly'}</changefreq>
    <priority>${(p.priority ?? 0.5).toFixed(1)}</priority>
  </url>`))
  .join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);

write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

write('manifest.webmanifest', JSON.stringify({
  name: dicts.ar.meta.siteName,
  short_name: dicts.ar.meta.brandShort,
  description: dicts.ar.pages.home.description,
  lang: 'ar',
  dir: 'rtl',
  start_url: '/ar/',
  scope: '/',
  display: 'standalone',
  background_color: '#F5ECD7',
  theme_color: data.site.themeColor,
  icons: [
    { src: '/assets/img/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/assets/img/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/assets/img/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2));

// Netlify headers & per-language 404s (ignored by other hosts)
write('_headers', `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/css/*
  Cache-Control: public, max-age=31536000, immutable
/assets/js/*
  Cache-Control: public, max-age=31536000, immutable
/assets/icons/*
  Cache-Control: public, max-age=31536000, immutable
/assets/img/*
  Cache-Control: public, max-age=2592000

/*.ics
  Content-Type: text/calendar; charset=utf-8
`);
write('_redirects', `/en/*  /en/404.html  404\n/ar/*  /ar/404.html  404\n`);

/* ------------------------------------------------------------------ .ics calendars */
const icsEscape = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Fold lines at 75 octets (RFC 5545), never splitting a multi-byte character. */
function fold(line) {
  const out = [];
  let cur = '';
  let bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch);
    const limit = out.length ? 74 : 75;
    if (bytes + b > limit) {
      out.push(cur);
      cur = '';
      bytes = 0;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join('\r\n ');
}

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
const nextDay = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
};
const domain = new URL(SITE).hostname;

function icsFile(lang, events) {
  const dict = dicts[lang];
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//Abnauona Institute//Academic Calendar//${lang.toUpperCase()}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(dict.calendar.icsDescription)}`,
    `X-WR-TIMEZONE:${data.calendar.timezone}`,
  ];
  for (const e of events) {
    const title = dict.calendar.events[e.id];
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.id}-${data.site.academicYear.replace('/', '-')}@${domain}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${e.date.replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${nextDay(e.date)}`,
      `SUMMARY:${icsEscape(`${title} – ${dict.meta.brandShort}`)}`,
      `DESCRIPTION:${icsEscape(`${dict.calendar.icsDescription}\n${SITE}/${lang}/calendar/`)}`,
      `LOCATION:${icsEscape(dict.contact.address)}`,
      `URL:${SITE}/${lang}/calendar/`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${icsEscape(title)}`,
      'TRIGGER:-PT15H',
      'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

for (const lang of data.site.languages) {
  for (const e of data.calendar.events) write(`${lang}/calendar/${e.id}.ics`, icsFile(lang, [e]));
  write(`${lang}/calendar/all.ics`, icsFile(lang, data.calendar.events));
}

/* ------------------------------------------------------------------ report */
for (const k of missing) warnings.push(`missing translation key: ${k}`);
if (warnings.length) {
  console.warn(`\n⚠  ${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`   - ${w}`);
}
console.log(`\n✔ Built ${pageCount} pages (${data.site.languages.join(' + ')}) into dist/ in ${Date.now() - started} ms`);
if (missing.size && process.argv.includes('--strict')) process.exit(1);
