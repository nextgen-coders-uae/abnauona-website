'use strict';
const c = require('../components');

module.exports = (ctx) => {
  const { t, icon, url } = ctx;
  const body = `
<section class="not-found bg-glyphs-dark">
  ${c.lotusColumn('page-hero-col page-hero-col--start is-lit')}
  ${c.lotusColumn('page-hero-col page-hero-col--end is-lit')}
  <div class="container container--narrow not-found-inner">
    <div class="nf-code" aria-hidden="true">
      <span>4</span>${icon('horus', 'nf-eye')}<span>4</span>
    </div>
    <h1 class="page-title">${t('notFound.title')}</h1>
    <p class="page-lead">${t('notFound.text')}</p>
    <div class="btn-row btn-row--center">
      ${c.btn(ctx, { href: url('home'), label: t('notFound.home'), icon: 'building' })}
      ${c.btn(ctx, { href: url('booking'), label: t('notFound.book'), variant: 'outline-light', icon: 'calendar-plus' })}
    </div>
    <p class="nf-links">${['programs', 'fees', 'calendar', 'contact'].map((id) => `<a href="${url(id)}">${t(`nav.${id}`)}</a>`).join(' · ')}</p>
  </div>
</section>`;
  return { body };
};
