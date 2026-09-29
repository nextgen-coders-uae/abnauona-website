'use strict';
const c = require('../components');

module.exports = (ctx) => {
  const { t } = ctx;
  const body = `
${c.pageHero(ctx, { title: t('gallery.title'), lead: t('gallery.lead') })}
<section class="section" aria-label="${t('gallery.title')}">
  <div class="container">
    ${c.galleryGrid(ctx, { filters: true })}
  </div>
</section>
${c.ctaBand(ctx)}`;
  return { body };
};
