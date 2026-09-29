'use strict';
/**
 * Site map. `path` is relative to the language folder (/ar/ or /en/).
 * Add a page here + a template file + "pages.<id>" title/description in both i18n files.
 */
const legal = require('./legal');

module.exports = [
  { id: 'home',       path: '',                   render: require('./home'),       priority: 1.0, changefreq: 'weekly' },
  { id: 'about',      path: 'about/',             render: require('./about'),      priority: 0.8 },
  { id: 'programs',   path: 'programs/',          render: require('./programs'),   priority: 0.9 },
  { id: 'activities', path: 'activities/',        render: require('./activities'), priority: 0.7 },
  { id: 'fees',       path: 'fees/',              render: require('./fees'),       priority: 0.9, changefreq: 'monthly' },
  { id: 'calendar',   path: 'calendar/',          render: require('./calendar'),   priority: 0.8, changefreq: 'monthly' },
  { id: 'gallery',    path: 'gallery/',           render: require('./gallery'),    priority: 0.6 },
  { id: 'booking',    path: 'booking/',           render: require('./booking'),    priority: 0.9 },
  { id: 'thanks',     path: 'booking/thank-you/', render: require('./thanks'),     noindex: true },
  { id: 'faq',        path: 'faq/',               render: require('./faq'),        priority: 0.7 },
  { id: 'news',       path: 'news/',              render: require('./news'),       priority: 0.6, changefreq: 'weekly' },
  { id: 'contact',    path: 'contact/',           render: require('./contact'),    priority: 0.8 },
  { id: 'privacy',    path: 'privacy/',           render: legal.privacy,           priority: 0.2 },
  { id: 'terms',      path: 'terms/',             render: legal.terms,             priority: 0.2 },
  { id: 'notFound',   path: '404.html',           render: require('./not-found'),  noindex: true, file: true },
];
