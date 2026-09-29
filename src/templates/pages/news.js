'use strict';
const c = require('../components');

module.exports = (ctx) => {
  const { t, raw, abs, url } = ctx;
  const body = `
${c.pageHero(ctx, { title: t('news.title'), lead: t('news.lead') })}
<section class="section bg-glyphs" aria-label="${t('news.title')}">
  <div class="container">
    ${c.newsCards(ctx, { full: true })}
  </div>
</section>
${c.ctaBand(ctx)}`;

  const jsonLd = raw('news.items').map((n) => ({
    '@type': 'NewsArticle',
    headline: n.title,
    description: n.text,
    datePublished: n.date,
    inLanguage: ctx.lang,
    url: abs(`${url('news')}#${n.id}`),
    image: n.image ? abs(ctx.imgLarge(n.image)) : undefined,
    publisher: { '@id': abs('/#organization') },
  }));
  return { body, jsonLd };
};
