'use strict';
const c = require('../components');

/** Shared template for the privacy policy and terms pages. */
const legalPage = (key) => (ctx) => {
  const { t, raw, esc, icon } = ctx;
  const doc = raw(`legal.${key}`);
  const updated = ctx.date(ctx.data.legalUpdated || new Date().toISOString().slice(0, 10));
  const body = `
${c.pageHero(ctx, { title: esc(doc.title), lead: t('legal.updated', { date: updated }) })}
<section class="section">
  <div class="container container--narrow">
    <article class="legal prose">
      <p class="note">${icon('info')}${t('legal.templateNote')}</p>
      <p class="prose-lead">${esc(doc.intro)}</p>
      ${doc.sections.map((s, i) => `<h2>${i + 1}. ${esc(s.h)}</h2><p>${esc(s.p)}</p>`).join('')}
    </article>
  </div>
</section>`;
  return { body };
};

module.exports = { privacy: legalPage('privacy'), terms: legalPage('terms') };
