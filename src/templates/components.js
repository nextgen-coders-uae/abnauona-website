'use strict';
/**
 * Reusable UI components. Each takes the page ctx (see helpers.js) and returns HTML.
 */
const { lotusColumn, wingedSun, rosetteDivider } = require('./ornaments');
const { waLink } = require('./layout');

/* ------------------------------------------------------------------ basics */

const sectionHead = (ctx, { kicker, title, lead, align = 'center', id, tone = '' }) => `
<header class="section-head section-head--${align}${tone ? ` section-head--${tone}` : ''}">
  ${kicker ? `<p class="kicker"><span class="cartouche">${ctx.icon('ankh')}${kicker}</span></p>` : ''}
  <h2 class="section-title"${id ? ` id="${id}"` : ''}>${title}</h2>
  ${lead ? `<p class="section-lead">${lead}</p>` : ''}
</header>`;

const btn = (ctx, { href, label, variant = 'gold', icon, iconEnd, size = '', attrs = '' }) =>
  `<a class="btn btn-${variant}${size ? ` btn-${size}` : ''}" href="${href}" ${attrs}>${icon ? ctx.icon(icon) : ''}<span>${label}</span>${iconEnd ? ctx.icon(iconEnd, 'icon-dir') : ''}</a>`;

const divider = (ctx, cls = '') => rosetteDivider(ctx.icon, cls);

/** Inner-page banner with breadcrumbs and glowing lotus columns. */
const pageHero = (ctx, { title, lead, extra = '' }) => `
<section class="page-hero bg-glyphs-dark">
  ${lotusColumn('page-hero-col page-hero-col--start is-lit')}
  ${lotusColumn('page-hero-col page-hero-col--end is-lit')}
  <div class="container page-hero-inner">
    <nav class="breadcrumbs" aria-label="${ctx.t('common.breadcrumb')}">
      <ol>
        <li><a href="${ctx.url('home')}">${ctx.t('nav.home')}</a></li>
        <li aria-current="page">${title}</li>
      </ol>
    </nav>
    <h1 class="page-title">${title}</h1>
    ${lead ? `<p class="page-lead">${lead}</p>` : ''}
    ${extra}
  </div>
</section>`;

const ctaBand = (ctx) => `
<section class="cta-band bg-glyphs-dark" aria-labelledby="cta-title">
  <div class="container cta-inner reveal">
    ${wingedSun('cta-sun')}
    <h2 id="cta-title" class="cta-title">${ctx.t('home.ctaTitle')}</h2>
    <p class="cta-text">${ctx.t('home.ctaText')}</p>
    <div class="cta-actions">
      ${btn(ctx, { href: ctx.url('booking'), label: ctx.t('hero.ctaBook'), icon: 'calendar-plus', size: 'lg' })}
      ${btn(ctx, { href: waLink(ctx, ctx.raw('common.waGreeting')), label: ctx.t('home.ctaWhatsapp'), variant: 'wa', icon: 'whatsapp', size: 'lg', attrs: 'target="_blank" rel="noopener"' })}
    </div>
  </div>
</section>`;

/* ------------------------------------------------------------------ programs */

const feeStagesFor = (ctx, programId) => ctx.data.fees.stages.filter((s) => s.program === programId);

const stageCards = (ctx) => `
<ul class="stage-grid" role="list">
  ${ctx.data.programs.map((p, i) => {
    const s = ctx.raw(`programs.stages.${p.id}`);
    const min = Math.min(...feeStagesFor(ctx, p.id).map((f) => f.arabic));
    return `<li class="stage-card tone-${p.tone} reveal" style="--d:${i * 80}ms">
      <div class="stage-card-top">${ctx.icon(p.icon)}<span class="stage-card-num" aria-hidden="true">0${i + 1}</span></div>
      <h3 class="stage-card-title">${ctx.esc(s.name)}</h3>
      <p class="stage-card-grades">${ctx.esc(s.grades)}</p>
      <p class="stage-card-ages">${ctx.icon('user')}${ctx.esc(s.ages)}</p>
      <p class="stage-card-price"><small>${ctx.t('common.from')}</small> ${ctx.moneyHtml(min)} <small>${ctx.t('common.perYear')}</small></p>
      <a class="stage-card-link" href="${ctx.url('programs')}#${p.id}">${ctx.t('common.learnMore')}<span class="sr-only"> — ${ctx.esc(s.name)}</span> ${ctx.icon('arrow', 'icon-dir')}</a>
    </li>`;
  }).join('')}
</ul>`;

/* ------------------------------------------------------------------ activities */

const activityCards = (ctx, { detailed = false } = {}) => `
<ul class="activity-grid${detailed ? ' activity-grid--detailed' : ''}" role="list">
  ${ctx.raw('activities.items').map((a, i) => `
  <li class="activity-card reveal" style="--d:${(i % 3) * 80}ms" id="${detailed ? a.id : ''}">
    <span class="activity-icon">${ctx.icon(a.icon)}</span>
    <h3>${ctx.esc(a.title)}</h3>
    <p>${ctx.esc(a.text)}</p>
  </li>`).join('')}
</ul>`;

/* ------------------------------------------------------------------ fees */

const feesTable = (ctx) => {
  const { t, raw, moneyHtml, esc, data } = ctx;
  const rows = data.fees.stages.map((s) => `
    <tr>
      <th scope="row"><span class="fees-stage">${esc(raw(`stages.${s.id}.name`))}</span><small>${esc(raw(`stages.${s.id}.grades`))}</small></th>
      <td data-col="arabic" data-label="${t('fees.thArabic')}">${moneyHtml(s.arabic)}</td>
      <td data-col="languages" data-label="${t('fees.thLanguages')}">${moneyHtml(s.languages)}</td>
      <td data-col="books" data-label="${t('fees.thBooks')}">${moneyHtml(s.booksPerTerm)}</td>
    </tr>`).join('');
  return `
<div class="fees-table-wrap" data-fees-table data-highlight="all">
  <div class="track-filter" role="group" aria-label="${t('fees.trackFilter')}">
    <span class="track-filter-label" aria-hidden="true">${t('fees.trackFilter')}</span>
    <button type="button" class="chip" aria-pressed="true" data-highlight-btn="all">${t('fees.trackAll')}</button>
    <button type="button" class="chip" aria-pressed="false" data-highlight-btn="arabic">${t('fees.thArabic')}</button>
    <button type="button" class="chip" aria-pressed="false" data-highlight-btn="languages">${t('fees.thLanguages')}</button>
  </div>
  <table class="fees-table">
    <caption class="sr-only">${t('fees.tableCaption')}</caption>
    <thead><tr>
      <th scope="col">${t('fees.thStage')}</th>
      <th scope="col" data-col="arabic">${t('fees.thArabic')}</th>
      <th scope="col" data-col="languages">${t('fees.thLanguages')}</th>
      <th scope="col" data-col="books">${t('fees.thBooks')}</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>`;
};

const extrasCards = (ctx) => {
  const { t, data, moneyHtml, icon } = ctx;
  const e = data.fees.extras;
  return `
<div class="extras-grid">
  <article class="info-card reveal">
    <h3 class="info-card-title">${icon('register')}${t('fees.extrasTitle')}</h3>
    <ul class="price-list">
      <li><span>${icon('shirt')}${t('fees.uniform')}</span><strong>${moneyHtml(e.uniform)}</strong></li>
      <li><span>${icon('register')}${t('fees.registration')}</span><strong>${moneyHtml(e.registration)}</strong></li>
      <li><span>${icon('bus')}${t('fees.busBooking')}</span><strong>${moneyHtml(e.busBooking)}</strong></li>
    </ul>
  </article>
  <article class="info-card reveal" style="--d:80ms">
    <h3 class="info-card-title">${icon('bus')}${t('fees.transportTitle')} <small>${t('fees.transportNote')}</small></h3>
    <ul class="price-list">
      ${data.fees.transport.map((z) => `<li><span>${icon('pin')}${t(`zones.${z.id}`)}</span><strong>${moneyHtml(z.price)}</strong></li>`).join('')}
    </ul>
  </article>
  <article class="info-card info-card--gold reveal" style="--d:160ms">
    <h3 class="info-card-title">${icon('star')}${t('fees.benefitsTitle')}</h3>
    <ul class="benefit-list">
      <li>${icon('users')}<div><strong>${t('fees.siblings')}</strong><p>${t('fees.siblingsText')}</p></div></li>
      <li>${icon('card')}<div><strong>${t('fees.installments')}</strong><p>${t('fees.installmentsText')}</p></div></li>
    </ul>
  </article>
</div>`;
};

/* ------------------------------------------------------------------ calendar */

const icsHref = (ctx, id) => `/${ctx.lang}/calendar/${id}.ics`;

const timeline = (ctx) => {
  const { data, raw, esc, icon, t } = ctx;
  return `
<div class="papyrus">
  <ol class="timeline">
    ${data.calendar.events.map((e, i) => {
      const d = ctx.dateParts(e.date);
      return `<li class="tl-item tl-${e.type} reveal" data-event-date="${e.date}" style="--d:${(i % 4) * 60}ms">
        <span class="tl-node" aria-hidden="true">${icon(e.type === 'start' ? 'book' : e.type === 'end' ? 'star' : e.type === 'final' ? 'cap' : 'exam')}</span>
        <div class="tl-card">
          <time class="tl-date" datetime="${e.date}">
            <span class="tl-weekday">${esc(d.weekday)}</span>
            <span class="tl-day">${esc(d.day)}</span>
            <span class="tl-month">${esc(d.month)} ${esc(d.year)}</span>
          </time>
          <div class="tl-body">
            <span class="tl-type">${t(`calendar.types.${e.type}`)}</span>
            <span class="tl-status" hidden></span>
            <h3 class="tl-title">${esc(raw(`calendar.events.${e.id}`))}</h3>
            <a class="tl-ics" href="${icsHref(ctx, e.id)}" download>${icon('calendar-plus')}${t('calendar.addToCalendar')}</a>
          </div>
        </div>
      </li>`;
    }).join('')}
  </ol>
</div>`;
};

const timelineCompact = (ctx) => {
  const { data, raw, esc, t } = ctx;
  return `
<ol class="tl-compact">
  ${data.calendar.events.map((e, i) => {
    const d = ctx.dateParts(e.date);
    return `<li class="tlc-item tl-${e.type} reveal" data-event-date="${e.date}" style="--d:${(i % 4) * 60}ms">
      <time datetime="${e.date}"><span class="tlc-day">${esc(d.day)}</span><span class="tlc-month">${esc(d.month)} ${esc(d.year)}</span></time>
      <span class="tlc-title">${esc(raw(`calendar.events.${e.id}`))}</span>
      <span class="tl-status" hidden></span>
    </li>`;
  }).join('')}
</ol>`;
};

const countdown = (ctx, cls = '') => {
  const { t, icon } = ctx;
  const unit = (k) => `<div class="cd-unit"><span class="cd-num" data-cd="${k}">00</span><span class="cd-label">${t(`countdown.${k}`)}</span></div>`;
  return `
<div class="countdown ${cls} js-only" data-countdown>
  <p class="cd-heading">${icon('hourglass')}<span>${t('countdown.until')}</span> <strong data-cd-title></strong></p>
  <div class="cd-units" role="timer" aria-live="off">${['days', 'hours', 'minutes', 'seconds'].map(unit).join('<span class="cd-sep" aria-hidden="true">:</span>')}</div>
  <p class="cd-date" data-cd-date></p>
  <p class="cd-done" hidden>${t('countdown.done')}</p>
</div>`;
};

/* ------------------------------------------------------------------ gallery */

const galleryItem = (ctx, g, { sizes }) => {
  const caption = ctx.raw(`gallery.items.${g.id}`);
  let thumb;
  let large;
  if (g.image) {
    thumb = ctx.img(g.image, { alt: caption, sizes, maxWidth: 800 });
    large = ctx.imgLarge(g.image);
  } else {
    large = `/assets/img/placeholders/${g.id}.svg`;
    thumb = `<img src="${large}" width="800" height="600" alt="${ctx.esc(caption)}" loading="lazy" decoding="async">`;
  }
  return `<li class="gallery-item" data-cat="${g.cat}">
    <a class="gallery-link" href="${large}" data-lightbox="gallery" data-caption="${ctx.esc(caption)}">
      ${thumb}
      <span class="gallery-cap" aria-hidden="true"><span>${ctx.esc(caption)}</span>${ctx.icon('zoom')}</span>
    </a>
  </li>`;
};

const galleryGrid = (ctx, { limit, filters = false } = {}) => {
  const items = limit ? ctx.data.gallery.filter((g) => g.image).slice(0, limit) : ctx.data.gallery;
  const cats = ['all', ...new Set(ctx.data.gallery.map((g) => g.cat))];
  const filterBar = filters
    ? `<div class="gallery-filters" role="group" aria-label="${ctx.t('gallery.filterLabel')}">
        ${cats.map((c, i) => `<button type="button" class="chip" data-filter="${c}" aria-pressed="${i === 0}">${ctx.t(`gallery.filters.${c}`)}</button>`).join('')}
      </div>`
    : '';
  return `${filterBar}
<ul class="gallery-grid${limit ? ' gallery-grid--preview' : ''}" role="list" data-gallery>
  ${items.map((g, i) => galleryItem(ctx, g, { sizes: limit ? (i === 0 ? '(min-width: 900px) 580px, 92vw' : '(min-width: 900px) 280px, 46vw') : '(min-width: 1100px) 380px, (min-width: 600px) 46vw, 92vw' })).join('')}
</ul>`;
};

const posterFigure = (ctx, name, { title, alt }) => `
<figure class="poster reveal">
  <a class="poster-link" href="${ctx.imgLarge(name)}" data-lightbox="poster-${name}" data-caption="${ctx.esc(title)}">
    ${ctx.img(name, { alt, sizes: '(min-width: 900px) 380px, 80vw', maxWidth: 540 })}
    <span class="poster-zoom" aria-hidden="true">${ctx.icon('zoom')}${ctx.t('common.viewPoster')}</span>
  </a>
  <figcaption>${ctx.esc(title)}</figcaption>
</figure>`;

/* ------------------------------------------------------------------ testimonials */

const testimonials = (ctx) => {
  const { raw, esc, t, icon } = ctx;
  const items = raw('testimonials.items');
  return `
<div class="slider" data-slider role="region" aria-roledescription="carousel" aria-label="${t('testimonials.label')}">
  <div class="slider-viewport">
    <div class="slider-track">
      ${items.map((q, i) => `
      <div class="slide" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${items.length}">
        <figure class="quote-card">
          ${icon('quote', 'quote-mark')}
          <blockquote><p>${esc(q.text)}</p></blockquote>
          <figcaption>
            <span class="quote-avatar" aria-hidden="true">${icon('user')}</span>
            <span><strong>${esc(q.author)}</strong><small>${esc(q.detail)}</small></span>
          </figcaption>
        </figure>
      </div>`).join('')}
    </div>
  </div>
  <div class="slider-controls">
    <button type="button" class="slider-btn" data-slider-prev aria-label="${t('testimonials.prev')}">${icon('chevron', 'icon-dir-rev')}</button>
    <div class="slider-dots"></div>
    <button type="button" class="slider-btn" data-slider-next aria-label="${t('testimonials.next')}">${icon('chevron', 'icon-dir')}</button>
  </div>
</div>`;
};

/* ------------------------------------------------------------------ news */

const newsItems = (ctx) => [...ctx.raw('news.items')].sort((a, b) => b.date.localeCompare(a.date));

const newsCards = (ctx, { limit, full = false } = {}) => {
  const items = newsItems(ctx).slice(0, limit || undefined);
  return `
<ul class="news-grid${full ? ' news-grid--full' : ''}" role="list">
  ${items.map((n, i) => `
  <li class="news-card reveal" style="--d:${(i % 3) * 80}ms"${full ? ` id="${n.id}"` : ''}>
    <article>
      ${n.image ? `<div class="news-media">${ctx.img(n.image, { alt: '', sizes: full ? '(min-width: 800px) 340px, 92vw' : '(min-width: 900px) 360px, 92vw', maxWidth: 800 })}</div>` : ''}
      <div class="news-body">
        <p class="news-meta"><span class="news-tag">${ctx.t(`news.tags.${n.tag}`)}</span><time datetime="${n.date}">${ctx.esc(ctx.date(n.date))}</time></p>
        <h3 class="news-title">${full ? ctx.esc(n.title) : `<a href="${ctx.url('news')}#${n.id}">${ctx.esc(n.title)}</a>`}</h3>
        <p class="news-text">${ctx.esc(n.text)}</p>
      </div>
    </article>
  </li>`).join('')}
</ul>`;
};

/* ------------------------------------------------------------------ faq */

const faqList = (ctx, { limit } = {}) => {
  const items = ctx.raw('faq.items').slice(0, limit || undefined);
  return `
<div class="faq-list">
  ${items.map((f, i) => `
  <details class="faq-item reveal" name="faq"${i === 0 ? ' open' : ''}>
    <summary><span class="faq-q">${ctx.esc(f.q)}</span><span class="faq-toggle" aria-hidden="true"></span></summary>
    <div class="faq-a"><p>${ctx.esc(f.a)}</p></div>
  </details>`).join('')}
</div>`;
};

const faqSchema = (ctx) => ({
  '@type': 'FAQPage',
  mainEntity: ctx.raw('faq.items').map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

/* ------------------------------------------------------------------ about */

const featureGrid = (ctx, key, cls = '') => `
<ul class="feature-grid ${cls}" role="list">
  ${ctx.raw(key).map((w, i) => `
  <li class="feature reveal" style="--d:${(i % 3) * 80}ms">
    <span class="feature-icon">${ctx.icon(w.icon)}</span>
    <div><h3>${ctx.esc(w.title)}</h3><p>${ctx.esc(w.text)}</p></div>
  </li>`).join('')}
</ul>`;

module.exports = {
  sectionHead,
  btn,
  divider,
  pageHero,
  ctaBand,
  feeStagesFor,
  stageCards,
  activityCards,
  feesTable,
  extrasCards,
  icsHref,
  timeline,
  timelineCompact,
  countdown,
  galleryGrid,
  posterFigure,
  testimonials,
  newsCards,
  faqList,
  faqSchema,
  featureGrid,
  lotusColumn,
};
