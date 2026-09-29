'use strict';
const c = require('../components');

module.exports = (ctx) => {
  const { t, raw, icon, esc, url, data, moneyHtml } = ctx;

  const tracks = ['arabic', 'languages'].map((k, i) => `
    <article class="track-card track-card--${k} reveal" style="--d:${i * 100}ms">
      <span class="track-icon">${icon(k === 'arabic' ? 'book' : 'globe')}</span>
      <h3>${t(`programs.tracks.${k}.name`)}</h3>
      <p>${t(`programs.tracks.${k}.text`)}</p>
    </article>`).join('');

  const stages = data.programs.map((p, i) => {
    const s = raw(`programs.stages.${p.id}`);
    const feeRows = c.feeStagesFor(ctx, p.id);
    return `
    <article class="program tone-${p.tone} reveal" id="${p.id}" aria-labelledby="${p.id}-title">
      <div class="program-emblem">
        <span class="program-num">0${i + 1}</span>
        ${icon(p.icon, 'program-icon')}
        <dl class="program-facts">
          <div><dt>${t('programs.grades')}</dt><dd>${esc(s.grades)}</dd></div>
          <div><dt>${t('programs.ages')}</dt><dd>${esc(s.ages)}</dd></div>
        </dl>
      </div>
      <div class="program-body">
        <h3 class="program-title" id="${p.id}-title">${esc(s.name)}</h3>
        <p>${esc(s.text)}</p>
        <h4 class="program-sub">${t('programs.includes')}</h4>
        <ul class="check-list">${s.points.map((pt) => `<li>${icon('check')}${esc(pt)}</li>`).join('')}</ul>
      </div>
      <div class="program-fees">
        <h4 class="program-sub">${t('programs.feesFrom')}</h4>
        ${feeRows.map((f) => `
        <div class="program-fee">
          ${feeRows.length > 1 ? `<p class="program-fee-name">${esc(raw(`stages.${f.id}.name`))}</p>` : ''}
          <p><span>${t('tracks.arabic')}</span><strong>${moneyHtml(f.arabic)}</strong></p>
          <p><span>${t('tracks.languages')}</span><strong>${moneyHtml(f.languages)}</strong></p>
          <p class="program-fee-books"><span>${t('fees.thBooks')}</span><strong>${moneyHtml(f.booksPerTerm)}</strong></p>
        </div>`).join('')}
        ${c.btn(ctx, { href: `${url('booking')}?stage=${feeRows[0].id}`, label: t('common.bookStage'), icon: 'calendar-plus', size: 'sm' })}
      </div>
    </article>`;
  }).join('');

  const body = `
${c.pageHero(ctx, {
    title: t('programs.title'),
    lead: t('programs.lead'),
    extra: `<ul class="hero-jump" role="list">${data.programs.map((p) => `<li><a href="#${p.id}">${icon(p.icon)}${t(`programs.stages.${p.id}.name`)}</a></li>`).join('')}</ul>`,
  })}

<section class="section" aria-labelledby="tracks-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('programs.tracksKicker'), title: t('programs.tracksTitle'), id: 'tracks-title' })}
    <div class="track-grid">${tracks}</div>
  </div>
</section>

<section class="section section--alt bg-glyphs" aria-labelledby="stages-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('programs.stagesKicker'), title: t('programs.stagesTitle'), id: 'stages-title' })}
    <div class="program-list">${stages}</div>
    <p class="section-more">${c.btn(ctx, { href: url('fees'), label: t('home.feesCta'), variant: 'ghost', icon: 'wallet' })}</p>
  </div>
</section>

${c.ctaBand(ctx)}`;

  return {
    body,
    jsonLd: [{
      '@type': 'ItemList',
      name: raw('programs.title'),
      itemListElement: data.programs.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Course',
          name: raw(`programs.stages.${p.id}.name`),
          description: raw(`programs.stages.${p.id}.text`),
          provider: { '@id': ctx.abs('/#organization') },
        },
      })),
    }],
  };
};
