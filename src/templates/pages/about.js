'use strict';
const c = require('../components');

module.exports = (ctx) => {
  const { t, raw, icon, img, esc, url } = ctx;

  const body = `
${c.pageHero(ctx, { title: t('about.title'), lead: t('about.lead') })}

<section class="section" aria-labelledby="story-title">
  <div class="container split">
    <div class="split-text">
      ${c.sectionHead(ctx, { kicker: t('about.storyKicker'), title: t('about.storyTitle'), align: 'start', id: 'story-title' })}
      <div class="prose">${raw('about.story').map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </div>
    <div class="split-media collage reveal">
      <div class="collage-main">${img('facade-day', { alt: raw('about.imageAlt'), sizes: '(min-width: 960px) 520px, 92vw', maxWidth: 1280 })}</div>
      <div class="collage-small">${img('column-detail', { alt: raw('about.corridorAlt'), sizes: '160px' })}</div>
    </div>
  </div>
</section>

<section class="section section--alt bg-glyphs" aria-label="${t('about.visionTitle')} / ${t('about.missionTitle')}">
  <div class="container vm-grid">
    <article class="vm-card reveal">
      <span class="vm-icon">${icon('eye')}</span>
      <h2>${t('about.visionTitle')}</h2>
      <p>${t('about.vision')}</p>
    </article>
    <article class="vm-card vm-card--royal reveal" style="--d:100ms">
      <span class="vm-icon">${icon('target')}</span>
      <h2>${t('about.missionTitle')}</h2>
      <p>${t('about.mission')}</p>
    </article>
  </div>
</section>

<section class="section" aria-labelledby="values-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('about.valuesKicker'), title: t('about.valuesTitle'), id: 'values-title' })}
    <ul class="values-row" role="list">
      ${raw('about.values').map((v, i) => `
      <li class="value reveal" style="--d:${i * 70}ms">
        <span class="value-icon">${icon(v.icon)}</span>
        <h3>${esc(v.title)}</h3>
        <p>${esc(v.text)}</p>
      </li>`).join('')}
    </ul>
  </div>
</section>

${c.divider(ctx)}

<section class="section" aria-labelledby="why-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('about.whyKicker'), title: t('about.whyTitle'), id: 'why-title' })}
    ${c.featureGrid(ctx, 'about.why')}
  </div>
</section>

<section class="section section--dark bg-glyphs-dark" aria-labelledby="grad-title">
  <div class="container split split--center">
    <figure class="framed-photo reveal">${img('graduation-2025', { alt: raw('about.graduationAlt'), sizes: '(min-width: 960px) 560px, 92vw' })}</figure>
    <div class="split-text">
      ${c.sectionHead(ctx, { kicker: t('activities.highlightKicker'), title: t('activities.highlightTitle'), align: 'start', id: 'grad-title', tone: 'dark' })}
      <p class="prose-lead">${t('activities.highlightText')}</p>
      ${c.btn(ctx, { href: url('gallery'), label: t('home.galleryCta'), variant: 'outline-light', icon: 'image' })}
    </div>
  </div>
</section>

${c.ctaBand(ctx)}`;

  return { body };
};
