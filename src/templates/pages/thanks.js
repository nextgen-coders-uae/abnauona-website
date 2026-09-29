'use strict';
const c = require('../components');

module.exports = (ctx) => {
  const { t, raw, icon, esc, url } = ctx;
  const body = `
<section class="thanks-hero bg-glyphs-dark">
  ${c.lotusColumn('page-hero-col page-hero-col--start is-lit')}
  ${c.lotusColumn('page-hero-col page-hero-col--end is-lit')}
  <div class="container container--narrow thanks-inner">
    <span class="thanks-seal">${icon('check')}</span>
    <h1 class="page-title">${t('thanks.title')}</h1>
    <p class="page-lead">${t('thanks.lead')}</p>
    <div class="order-box" data-order-box hidden>
      <span>${t('thanks.orderLabel')}</span>
      <strong dir="ltr" data-order-id>—</strong>
    </div>
    <p class="thanks-missing" data-no-order hidden>${t('thanks.noOrder')}</p>
    <div class="btn-row btn-row--center">
      <a class="btn btn-wa" href="https://wa.me/${ctx.data.contact.whatsapp}" target="_blank" rel="noopener" data-resend hidden>${icon('whatsapp')}<span>${t('thanks.resend')}</span></a>
      ${c.btn(ctx, { href: url('home'), label: t('thanks.home'), variant: 'outline-light' })}
    </div>
  </div>
</section>

<section class="section bg-glyphs" aria-labelledby="next-title">
  <div class="container thanks-grid">
    <div>
      <h2 class="section-title section-title--sm" id="next-title">${t('thanks.nextTitle')}</h2>
      <ol class="steps-list">
        ${raw('thanks.next').map((s, i) => `<li class="reveal" style="--d:${i * 70}ms"><span class="steps-num">${i + 1}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`).join('')}
      </ol>
    </div>
    <div class="docs-card card reveal">
      <h2 class="section-title section-title--sm">${icon('file')}${t('thanks.docsTitle')}</h2>
      <ul class="check-list">${raw('thanks.docs').map((d) => `<li>${icon('check')}${esc(d)}</li>`).join('')}</ul>
      <p class="note">${icon('info')}${t('thanks.docsNote')}</p>
      ${c.btn(ctx, { href: url('booking'), label: t('thanks.another'), variant: 'royal', icon: 'users' })}
    </div>
  </div>
</section>`;
  return { body, scripts: ['thanks'] };
};
