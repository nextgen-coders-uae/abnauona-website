'use strict';
const c = require('../components');

module.exports = (ctx) => {
  const { t, raw, icon, lang } = ctx;

  const body = `
${c.pageHero(ctx, {
    title: t('calendar.title'),
    lead: t('calendar.lead'),
    extra: `<div class="btn-row btn-row--center">${c.btn(ctx, { href: `/${lang}/calendar/all.ics`, label: t('calendar.downloadAll'), icon: 'calendar-plus', attrs: 'download' })}</div>`,
  })}

<section class="section bg-glyphs" aria-labelledby="timeline-title">
  <div class="container calendar-layout">
    <div class="calendar-main">
      <h2 class="sr-only" id="timeline-title">${t('calendar.title')}</h2>
      ${c.timeline(ctx)}
      <p class="note">${icon('info')}${t('calendar.note')}</p>
    </div>
    <aside class="calendar-aside">
      ${c.countdown(ctx, 'countdown--card')}
      ${c.posterFigure(ctx, 'poster-calendar', { title: raw('calendar.posterTitle'), alt: raw('calendar.posterAlt') })}
      ${c.btn(ctx, { href: `/${lang}/calendar/all.ics`, label: t('calendar.downloadAll'), variant: 'royal', icon: 'download', attrs: 'download' })}
    </aside>
  </div>
</section>

${c.ctaBand(ctx)}`;

  return { body };
};
