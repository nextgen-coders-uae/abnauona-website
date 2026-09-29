'use strict';
const c = require('../components');

module.exports = (ctx) => {
  const { t, raw, img, url } = ctx;

  const body = `
${c.pageHero(ctx, { title: t('activities.title'), lead: t('activities.lead') })}

<section class="section bg-glyphs" aria-labelledby="act-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('home.activitiesKicker'), title: t('home.activitiesTitle'), lead: t('home.activitiesLead'), id: 'act-title' })}
    ${c.activityCards(ctx, { detailed: true })}
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

<section class="section" aria-labelledby="gal-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('home.galleryKicker'), title: t('home.galleryTitle'), id: 'gal-title' })}
    ${c.galleryGrid(ctx, { limit: 5 })}
    <p class="section-more">${c.btn(ctx, { href: url('gallery'), label: t('home.galleryCta'), variant: 'ghost', icon: 'image' })}</p>
  </div>
</section>

${c.ctaBand(ctx)}`;

  return { body };
};
