'use strict';
const c = require('../components');

module.exports = (ctx) => {
  const { t, raw, url, icon, img, data, moneyHtml, esc } = ctx;
  const minFee = Math.min(...data.fees.stages.map((s) => s.arabic));
  const hero = data.images['facade-night'];

  const body = `
<section class="hero" aria-labelledby="hero-title">
  <div class="hero-media">
    ${img('facade-night', { alt: raw('hero.imageAlt'), sizes: '100vw', eager: true, cls: 'hero-img' })}
  </div>
  <div class="hero-shade" aria-hidden="true"></div>
  ${c.lotusColumn('hero-col hero-col--start is-lit')}
  ${c.lotusColumn('hero-col hero-col--end is-lit')}
  <div class="container hero-inner">
    <div class="hero-content">
      <p class="hero-kicker">${t('hero.kicker')}</p>
      <h1 id="hero-title" class="hero-title"><span>${t('hero.title1')}</span> <span class="gold-text">${t('hero.title2')}</span></h1>
      <p class="hero-lead">${t('hero.lead')}</p>
      <div class="hero-actions">
        ${c.btn(ctx, { href: url('booking'), label: t('hero.ctaBook'), icon: 'calendar-plus', size: 'lg' })}
        ${c.btn(ctx, { href: url('fees'), label: t('hero.ctaFees'), variant: 'outline-light', iconEnd: 'arrow', size: 'lg' })}
      </div>
    </div>
    ${c.countdown(ctx, 'countdown--glass hero-countdown')}
  </div>
</section>

<section class="stats-band" aria-label="${t('stats.title')}">
  <div class="container">
    <ul class="stats" role="list">
      ${data.stats.map((s) => `
      <li class="stat">
        <span class="stat-num"><span data-count="${s.value}">${s.value}</span>${esc(s.suffix)}</span>
        <span class="stat-label">${t(`stats.${s.id}`)}</span>
      </li>`).join('')}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="about-title">
  <div class="container split">
    <div class="split-media collage reveal">
      <div class="collage-main">${img('facade-day', { alt: raw('about.imageAlt'), sizes: '(min-width: 960px) 520px, 92vw', maxWidth: 1280 })}</div>
      <div class="collage-small">${img('column-detail', { alt: raw('about.corridorAlt'), sizes: '160px' })}</div>
      <span class="collage-emblem" aria-hidden="true">${icon('horus')}</span>
    </div>
    <div class="split-text">
      ${c.sectionHead(ctx, { kicker: t('home.aboutKicker'), title: t('home.aboutTitle'), align: 'start', id: 'about-title' })}
      <p class="prose-lead">${t('home.aboutText')}</p>
      <ul class="check-list">${raw('home.aboutPoints').map((p) => `<li>${icon('check')}${esc(p)}</li>`).join('')}</ul>
      ${c.btn(ctx, { href: url('about'), label: t('home.aboutCta'), variant: 'royal', iconEnd: 'arrow' })}
    </div>
  </div>
</section>

<section class="section section--alt bg-glyphs" aria-labelledby="programs-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('home.programsKicker'), title: t('home.programsTitle'), lead: t('home.programsLead'), id: 'programs-title' })}
    ${c.stageCards(ctx)}
  </div>
</section>

<section class="section" aria-labelledby="activities-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('home.activitiesKicker'), title: t('home.activitiesTitle'), lead: t('home.activitiesLead'), id: 'activities-title' })}
    ${c.activityCards(ctx)}
    <p class="section-more">${c.btn(ctx, { href: url('activities'), label: t('home.activitiesCta'), variant: 'ghost', iconEnd: 'arrow' })}</p>
  </div>
</section>

<section class="section section--dark bg-glyphs-dark" aria-labelledby="fees-title">
  <div class="container split split--center">
    <div class="split-text">
      ${c.sectionHead(ctx, { kicker: t('home.feesKicker'), title: t('home.feesTitle'), align: 'start', id: 'fees-title', tone: 'dark' })}
      <p class="prose-lead">${t('home.feesLead', { min: ctx.num(minFee) })}</p>
      <ul class="pill-list">${raw('home.feesPoints').map((p, i) => `<li>${icon(['card', 'users', 'bus', 'wallet'][i] || 'check')}${esc(p)}</li>`).join('')}</ul>
      <div class="btn-row">
        ${c.btn(ctx, { href: url('fees'), label: t('home.feesCta'), iconEnd: 'arrow' })}
        ${c.btn(ctx, { href: url('booking'), label: t('common.bookNow'), variant: 'outline-light' })}
      </div>
    </div>
    <div class="price-board reveal">
      <div class="price-board-head"><span>${t('fees.thStage')}</span><span>${t('fees.thArabic')}</span><span>${t('fees.thLanguages')}</span></div>
      ${data.fees.stages.map((s) => `
      <div class="price-board-row">
        <span class="pb-stage">${esc(raw(`stages.${s.id}.name`))}</span>
        <span class="pb-price">${moneyHtml(s.arabic)}</span>
        <span class="pb-price pb-price--lang">${moneyHtml(s.languages)}</span>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="calendar-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('home.calendarKicker'), title: t('home.calendarTitle'), id: 'calendar-title' })}
    <div class="calendar-teaser">
      ${c.countdown(ctx, 'countdown--card')}
      ${c.timelineCompact(ctx)}
    </div>
    <p class="section-more">${c.btn(ctx, { href: url('calendar'), label: t('home.calendarCta'), variant: 'royal', icon: 'calendar' })}</p>
  </div>
</section>

<section class="section section--alt" aria-labelledby="gallery-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('home.galleryKicker'), title: t('home.galleryTitle'), id: 'gallery-title' })}
    ${c.galleryGrid(ctx, { limit: 5 })}
    <p class="section-more">${c.btn(ctx, { href: url('gallery'), label: t('home.galleryCta'), variant: 'ghost', icon: 'image' })}</p>
  </div>
</section>

<section class="section bg-glyphs" aria-labelledby="testimonials-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('home.testimonialsKicker'), title: t('home.testimonialsTitle'), id: 'testimonials-title' })}
    ${c.testimonials(ctx)}
  </div>
</section>

<section class="section section--alt" aria-labelledby="news-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('home.newsKicker'), title: t('home.newsTitle'), id: 'news-title' })}
    ${c.newsCards(ctx, { limit: 3 })}
    <p class="section-more">${c.btn(ctx, { href: url('news'), label: t('home.newsCta'), variant: 'ghost', iconEnd: 'arrow' })}</p>
  </div>
</section>

${c.ctaBand(ctx)}`;

  // Preload the LCP hero image with the same srcset the <img> uses.
  const preload = `<link rel="preload" as="image" type="image/webp" fetchpriority="high" imagesrcset="${hero.widths
    .map((w) => `/assets/img/photos/facade-night-${w}.webp ${w}w`)
    .join(', ')}" imagesizes="100vw">`;

  return { body, preload };
};
