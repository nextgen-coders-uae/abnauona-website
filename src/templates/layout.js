'use strict';
/**
 * Page shell: <head> (SEO, Open Graph, hreflang, Schema.org), header, footer,
 * floating contact buttons, lightbox and analytics consent.
 */

const NAV = ['about', 'programs', 'activities', 'fees', 'calendar', 'gallery', 'news', 'faq', 'contact'];

const FONTS = {
  ar: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Reem+Kufi:wght@500;600;700&display=swap',
  en: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&display=swap',
};

function waLink(ctx, text) {
  return `https://wa.me/${ctx.data.contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/* ---------------------------------------------------------------- Schema.org */
function organizationSchema(ctx) {
  const { data, dict, abs, url } = ctx;
  const c = data.contact;
  const sameAs = Object.values(data.social).filter(Boolean);
  const org = {
    '@type': ['EducationalOrganization', 'LocalBusiness'],
    '@id': abs('/#organization'),
    name: dict.meta.siteName,
    alternateName: ['ABNAUONA', 'Abnauona Institute Abroad', 'معهد أبناؤنا في الخارج'].filter((n) => n !== dict.meta.siteName),
    url: abs(url('home')),
    logo: abs('/assets/img/brand/logo-mark-brown-400.png'),
    image: [abs('/assets/img/brand/og-image.jpg'), abs(ctx.imgLarge('facade-night'))],
    description: dict.pages.home.description,
    email: c.email,
    telephone: c.phones.map((p) => p.tel),
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.address.street,
      addressLocality: c.address.city,
      addressRegion: c.address.city,
      addressCountry: c.address.country,
    },
    areaServed: ['Ajman', 'Sharjah', 'Dubai'].map((name) => ({ '@type': 'City', name })),
    contactPoint: [{
      '@type': 'ContactPoint',
      telephone: `+${c.whatsapp}`,
      contactType: 'admissions',
      availableLanguage: ['Arabic', 'English'],
    }],
    priceRange: `AED ${ctx.num(Math.min(...data.fees.stages.map((s) => s.arabic)))} – ${ctx.num(Math.max(...data.fees.stages.map((s) => s.languages)))}`,
    currenciesAccepted: 'AED',
    hasMap: c.map.placeUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.map.query)}`,
  };
  if (sameAs.length) org.sameAs = sameAs;
  if (c.map.lat && c.map.lng) org.geo = { '@type': 'GeoCoordinates', latitude: c.map.lat, longitude: c.map.lng };
  return org;
}

function pageSchema(ctx, extra = []) {
  const { dict, page, abs, url } = ctx;
  const graph = [organizationSchema(ctx)];
  graph.push({
    '@type': 'WebSite',
    '@id': abs('/#website'),
    url: abs('/'),
    name: dict.meta.siteName,
    inLanguage: ['ar', 'en'],
    publisher: { '@id': abs('/#organization') },
  });
  if (page.id !== 'home') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: abs(url('home')) },
        { '@type': 'ListItem', position: 2, name: dict.pages[page.id].title.split('|')[0].trim(), item: abs(url(page.id)) },
      ],
    });
  }
  graph.push(...extra);
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

/* ---------------------------------------------------------------- <head> */
function head(ctx, { preload = '', jsonLd = [] }) {
  const { dict, data, page, lang, otherLang, abs, url, t, esc, asset } = ctx;
  const meta = dict.pages[page.id];
  const canonical = abs(url(page.id));
  const ogImage = abs('/assets/img/brand/og-image.jpg');
  const otherDict = ctx.otherDict;

  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
${page.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${lang}" href="${canonical}">
<link rel="alternate" hreflang="${otherLang}" href="${abs(url(page.id, otherLang))}">
<link rel="alternate" hreflang="x-default" href="${abs(url(page.id, data.site.defaultLang))}">
<meta name="theme-color" content="${data.site.themeColor}">
<meta name="color-scheme" content="light">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(dict.meta.siteName)}">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(dict.meta.siteName)}">
<meta property="og:locale" content="${dict.meta.ogLocale}">
<meta property="og:locale:alternate" content="${otherDict.meta.ogLocale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(meta.title)}">
<meta name="twitter:description" content="${esc(meta.description)}">
<meta name="twitter:image" content="${ogImage}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/img/brand/icon-192.png">
<link rel="apple-touch-icon" href="/assets/img/brand/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS[lang]}" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="${FONTS[lang]}"></noscript>
${preload}
<link rel="stylesheet" href="${asset('css/main.css')}">
<script>(function(h){h.classList.add('js');try{localStorage.setItem('abn-lang','${lang}');if(localStorage.getItem('abn-ann')==='${data.announcement.id}')h.classList.add('ann-closed')}catch(e){}})(document.documentElement)</script>
<script type="application/ld+json">${pageSchema(ctx, jsonLd)}</script>
</head>`;
}

/* ---------------------------------------------------------------- header */
function announcement(ctx) {
  const { data, t, url, icon } = ctx;
  if (!data.announcement.enabled) return '';
  return `<div class="announcement" data-announcement="${data.announcement.id}" role="region" aria-label="${t('announcement.text')}">
  <div class="container announcement-inner">
    ${icon('scarab', 'announcement-icon')}
    <p><span>${t('announcement.text')}</span> <a href="${url('booking')}">${t('announcement.cta')} ${icon('arrow', 'icon-dir')}</a></p>
    <button type="button" class="announcement-close" aria-label="${t('announcement.close')}">${icon('close')}</button>
  </div>
</div>`;
}

function header(ctx) {
  const { t, url, page, icon, otherLang, dict, asset } = ctx;
  const links = NAV.map((id) => {
    const current = page.id === id ? ' aria-current="page"' : '';
    return `<li><a href="${url(id)}"${current}>${t(`nav.${id}`)}</a></li>`;
  }).join('');
  const phone = ctx.data.contact.phones[2] || ctx.data.contact.phones[0];

  return `<header class="site-header" id="top">
  <div class="container header-inner">
    <a class="brand" href="${url('home')}">
      <img class="brand-mark" src="/assets/img/brand/logo-mark-brown-96.webp" width="36" height="48" alt="">
      <span class="brand-text"><strong>${t('meta.brandShort')}</strong><small lang="${otherLang}">${t('meta.brandLatin')}</small></span>
    </a>
    <nav class="main-nav" id="main-nav" aria-label="${t('nav.mainLabel')}">
      <div class="nav-drawer-head">
        <span class="nav-drawer-title">${t('meta.siteName')}</span>
        <button type="button" class="nav-close" aria-label="${t('nav.closeMenu')}">${icon('close')}</button>
      </div>
      <ul class="nav-list">
        <li class="nav-home"><a href="${url('home')}"${page.id === 'home' ? ' aria-current="page"' : ''}>${t('nav.home')}</a></li>
        ${links}
      </ul>
      <div class="nav-drawer-foot">
        <a class="btn btn-gold btn-block" href="${url('booking')}">${icon('calendar-plus')}${t('nav.book')}</a>
        <div class="nav-drawer-contacts">
          <a href="https://wa.me/${ctx.data.contact.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')}${t('common.whatsapp')}</a>
          <a href="tel:${phone.tel}">${icon('phone')}<span dir="ltr">${ctx.esc(phone.display)}</span></a>
        </div>
      </div>
    </nav>
    <div class="header-actions">
      <a class="lang-switch" href="${url(ctx.page.id, otherLang)}" hreflang="${otherLang}" lang="${otherLang}" data-lang="${otherLang}" aria-label="${t('meta.switchLabel')}">${icon('globe')}<span>${t('meta.switchToShort')}</span></a>
      <a class="btn btn-gold btn-sm header-cta" href="${url('booking')}"${page.id === 'booking' ? ' aria-current="page"' : ''}>${t('nav.book')}</a>
      <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="${t('nav.menu')}">${icon('menu')}</button>
    </div>
  </div>
  <div class="nav-overlay" hidden></div>
</header>`;
}

/* ---------------------------------------------------------------- footer */
function socialLinks(ctx) {
  const { data, icon, esc, t } = ctx;
  const items = [
    { href: `https://wa.me/${data.contact.whatsapp}`, icon: 'whatsapp', label: t('common.whatsapp') },
    { href: `mailto:${data.contact.email}`, icon: 'mail', label: t('contact.emailLabel') },
  ];
  const names = { facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', x: 'X' };
  for (const [key, href] of Object.entries(data.social)) {
    if (href) items.push({ href, icon: key, label: names[key] });
  }
  return `<ul class="social">${items
    .map((s) => `<li><a href="${esc(s.href)}" ${s.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} aria-label="${s.label}">${icon(s.icon)}</a></li>`)
    .join('')}</ul>`;
}

function footer(ctx) {
  const { t, url, data, icon, esc, otherLang } = ctx;
  const quick = ['about', 'programs', 'activities', 'gallery', 'news', 'contact'];
  const parents = ['fees', 'calendar', 'booking', 'faq'];
  const li = (id) => `<li><a href="${url(id)}">${t(id === 'booking' ? 'nav.book' : `nav.${id}`)}</a></li>`;
  return `<footer class="site-footer bg-glyphs-dark">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand brand-light" href="${url('home')}">
        <img class="brand-mark" src="/assets/img/brand/logo-mark-gold-96.webp" width="36" height="48" alt="" loading="lazy">
        <span class="brand-text"><strong>${t('meta.brandShort')}</strong><small lang="${otherLang}">${t('meta.brandLatin')}</small></span>
      </a>
      <p>${t('footer.about')}</p>
      <p class="footer-follow">${t('footer.follow')}</p>
      ${socialLinks(ctx)}
    </div>
    <div>
      <h2 class="footer-title">${t('footer.quickLinks')}</h2>
      <ul class="footer-links">${quick.map(li).join('')}</ul>
    </div>
    <div>
      <h2 class="footer-title">${t('footer.parents')}</h2>
      <ul class="footer-links">${parents.map(li).join('')}</ul>
    </div>
    <div>
      <h2 class="footer-title">${t('footer.contactTitle')}</h2>
      <ul class="footer-contact">
        <li>${icon('pin')}<span>${t('contact.address')}</span></li>
        ${data.contact.phones.map((p) => `<li>${icon('phone')}<a href="tel:${p.tel}" dir="ltr">${esc(p.display)}</a></li>`).join('')}
        <li>${icon('whatsapp')}<a href="https://wa.me/${data.contact.whatsapp}" target="_blank" rel="noopener" dir="ltr">+${data.contact.whatsapp}</a></li>
        <li>${icon('mail')}<a href="mailto:${data.contact.email}">${esc(data.contact.email)}</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container footer-bottom-inner">
      <p>${t('footer.rights', { year: ctx.year })}</p>
      <ul>
        <li><a href="${url('privacy')}">${t('footer.privacy')}</a></li>
        <li><a href="${url('terms')}">${t('footer.terms')}</a></li>
        <li><a href="${url(ctx.page.id, otherLang)}" hreflang="${otherLang}" lang="${otherLang}" data-lang="${otherLang}">${t('meta.switchTo')}</a></li>
      </ul>
    </div>
  </div>
</footer>`;
}

/* ---------------------------------------------------------------- overlays */
function floating(ctx) {
  const { t, icon, data } = ctx;
  return `<div class="fab" role="complementary" aria-label="${t('common.chatWhatsapp')}">
  <a class="fab-btn fab-call" href="tel:${data.contact.callPhone}" aria-label="${t('common.callNow')}">${icon('phone')}</a>
  <a class="fab-btn fab-wa" href="${waLink(ctx, ctx.raw('common.waGreeting'))}" target="_blank" rel="noopener" aria-label="${t('common.chatWhatsapp')}">${icon('whatsapp')}<span class="fab-label">${t('common.whatsapp')}</span></a>
</div>`;
}

function lightbox(ctx) {
  const { t, icon } = ctx;
  return `<dialog class="lightbox" id="lightbox" aria-label="${t('gallery.title')}">
  <div class="lb-stage">
    <figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-caption"></figcaption></figure>
    <button type="button" class="lb-btn lb-prev" aria-label="${t('common.prev')}">${icon('chevron', 'icon-dir-rev')}</button>
    <button type="button" class="lb-btn lb-next" aria-label="${t('common.next')}">${icon('chevron', 'icon-dir')}</button>
    <button type="button" class="lb-btn lb-close" aria-label="${t('common.close')}">${icon('close')}</button>
    <p class="lb-counter" aria-live="polite"></p>
  </div>
</dialog>`;
}

function consentBanner(ctx) {
  const { data, t, url } = ctx;
  const a = data.analytics;
  if (!(a.googleAnalyticsId || a.metaPixelId) || !a.requireConsent) return '';
  return `<div class="consent" role="dialog" aria-live="polite" aria-label="${t('consent.more')}" hidden>
  <p>${t('consent.text')} <a href="${url('privacy')}">${t('consent.more')}</a></p>
  <div class="consent-actions">
    <button type="button" class="btn btn-sm btn-ghost-light" data-consent="deny">${t('consent.decline')}</button>
    <button type="button" class="btn btn-sm btn-gold" data-consent="grant">${t('consent.accept')}</button>
  </div>
</div>`;
}

/** Data handed to the browser scripts (prices, dates, UI strings). */
function clientData(ctx, extra = {}) {
  const { data, dict, lang, url } = ctx;
  const payload = {
    lang,
    dir: dict.meta.dir,
    intl: dict.meta.intl,
    whatsapp: data.contact.whatsapp,
    email: data.contact.email,
    announcement: data.announcement.id,
    analytics: data.analytics,
    timezoneOffset: '+04:00',
    events: data.calendar.events.map((e) => ({ ...e, title: dict.calendar.events[e.id] })),
    strings: {
      common: dict.common,
      countdown: dict.countdown,
      calendar: { past: dict.calendar.past, upcoming: dict.calendar.upcoming, today: dict.calendar.today },
      gallery: { counter: dict.gallery.counter },
      testimonials: { goTo: dict.testimonials.goTo },
    },
    urls: { booking: url('booking'), thanks: url('thanks') },
    ...extra,
  };
  return `<script id="abn-data" type="application/json">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`;
}

function layout(ctx, { body, scripts = [], preload = '', jsonLd = [], bodyClass = '', client = {} }) {
  const { lang, dir, t, asset } = ctx;
  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
${head(ctx, { preload, jsonLd })}
<body class="page-${ctx.page.id} ${bodyClass}">
<a class="skip-link" href="#main">${t('nav.skip')}</a>
${announcement(ctx)}
${header(ctx)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(ctx)}
${floating(ctx)}
${lightbox(ctx)}
${consentBanner(ctx)}
${clientData(ctx, client)}
<script src="${asset('js/main.js')}" defer></script>
${scripts.map((s) => `<script src="${asset(`js/${s}.js`)}" defer></script>`).join('\n')}
</body>
</html>`;
}

module.exports = { layout, waLink, NAV, FONTS };
