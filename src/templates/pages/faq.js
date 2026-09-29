'use strict';
const c = require('../components');
const { waLink } = require('../layout');

module.exports = (ctx) => {
  const { t, raw, icon } = ctx;
  const body = `
${c.pageHero(ctx, { title: t('faq.title'), lead: t('faq.lead') })}
<section class="section bg-glyphs" aria-label="${t('faq.title')}">
  <div class="container container--narrow">
    ${c.faqList(ctx)}
    <div class="still-box reveal">
      <span class="still-icon">${icon('question')}</span>
      <div>
        <h2>${t('faq.stillQuestion')}</h2>
        <p>${t('faq.stillText')}</p>
      </div>
      ${c.btn(ctx, { href: waLink(ctx, raw('common.waGreeting')), label: t('common.chatWhatsapp'), variant: 'wa', icon: 'whatsapp', attrs: 'target="_blank" rel="noopener"' })}
    </div>
  </div>
</section>`;
  return { body, jsonLd: [c.faqSchema(ctx)] };
};
