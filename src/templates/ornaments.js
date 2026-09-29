'use strict';
/**
 * Pharaonic decorative SVGs (lightweight, inline or generated as files by the build).
 */

const LOTUS_CAP = `<g class="lc-cap">
    <path d="M30 3c7 9 9.5 23 0 44-9.5-21-7-35 0-44z"/>
    <path d="M27 47C15 41 5.5 29 4 11c9 5 17.5 17 23 36z"/>
    <path d="M33 47c12-6 21.5-18 23-36-9 5-17.5 17-23 36z"/>
    <path d="M24 47c-7-6-12-15-14-26 6 5 10.5 13 14 26zM36 47c7-6 12-15 14-26-6 5-10.5 13-14 26z" class="lc-inner"/>
  </g>
  <rect class="lc-band" x="15" y="47" width="30" height="8" rx="2"/>`;

/**
 * A lotus-capital column. Colours come from CSS custom properties so it can "light up".
 * `short` renders a stubby version (used by the booking progress bar).
 */
const lotusColumn = (cls = '', { short = false } = {}) => short
  ? `<svg class="lotus-col ${cls}" viewBox="0 0 60 130" aria-hidden="true" focusable="false">
  ${LOTUS_CAP}
  <path class="lc-shaft" d="M16 55h28l-1.5 60h-25z"/>
  <path class="lc-line" d="M17 66h26M17 71h26M23 78v32M30 78v32M37 78v32"/>
  <rect class="lc-base" x="10" y="115" width="40" height="13" rx="3"/>
</svg>`
  : `<svg class="lotus-col ${cls}" viewBox="0 0 60 240" aria-hidden="true" focusable="false">
  ${LOTUS_CAP}
  <path class="lc-shaft" d="M17 55h26l-1.5 167h-23z"/>
  <path class="lc-line" d="M18 70h24M18 76h24M18.4 160h23.2M18.5 166h23M24 84v70M30 84v70M36 84v70M24 174v44M30 174v44M36 174v44"/>
  <rect class="lc-base" x="11" y="222" width="38" height="14" rx="3"/>
</svg>`;

/** Winged sun disk with twin uraei — used above call-to-action titles. */
const wingedSun = (cls = '') => {
  const wing = `<path d="M50 15C40 8 23 5 3 9c16 2 31 6 47 13z"/><path d="M50 21C38 16 22 15 7 19c15 1 29 4 43 9z"/><path d="M51 27c-10-3-22-3-35 2 12 0 24 1 35 4z"/>`;
  return `<svg class="winged-sun ${cls}" viewBox="0 0 120 44" aria-hidden="true" focusable="false">
  <defs><linearGradient id="ws-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCEBB0"/><stop offset=".55" stop-color="#E3B54A"/><stop offset="1" stop-color="#B8891E"/></linearGradient></defs>
  <g fill="url(#ws-g)">
    <g>${wing}</g>
    <g transform="translate(120 0) scale(-1 1)">${wing}</g>
    <circle cx="60" cy="17" r="10"/>
    <path d="M53.5 25c-1.5 3 1.5 5.5 0 9.5-1 2.5-3 3-4.5 2 2 0 3-1 3.2-3 .3-3-2.2-5.3-1-8.5zM66.5 25c1.5 3-1.5 5.5 0 9.5 1 2.5 3 3 4.5 2-2 0-3-1-3.2-3-.3-3 2.2-5.3 1-8.5z"/>
  </g>
  <circle cx="60" cy="17" r="6.5" fill="none" stroke="#7A5C0E" stroke-opacity=".35" stroke-width="1"/>
</svg>`;
};

/** Horizontal divider with the circular gate rosette in the middle. */
const rosetteDivider = (icon, cls = '') =>
  `<div class="divider ${cls}" aria-hidden="true"><span class="divider-line"></span>${icon('rosette', 'divider-rosette')}<span class="divider-line"></span></div>`;

/** Repeating hieroglyph tile used as a faint section background. */
const patternSvg = (color, opacity) => `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
<g fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M32 40c-6-4-8.5-8.5-8.5-12.5 0-4.8 3.8-8.5 8.5-8.5s8.5 3.7 8.5 8.5c0 4-2.5 8.5-8.5 12.5zM19 42h26M32 42v26"/>
<path d="M80 38c8-8 16-10 24-10s16 2 24 10c-8 6-16 8-24 8s-16-2-24-8z"/><circle cx="104" cy="37" r="4.5"/><path d="M100 46l-3 14M108 45c3 6 8 9 12 8 3-1 3-5 0-5M78 26c12-7 40-7 52 0"/>
<path d="M176 14c6 10 6 32 0 50-5-18-5-40 0-50zM176 64v10"/>
<path d="M10 112l7-7 7 7 7-7 7 7 7-7 7 7 7-7 7 7M10 124l7-7 7 7 7-7 7 7 7-7 7 7 7-7 7 7"/>
<ellipse cx="118" cy="120" rx="10" ry="13"/><path d="M118 107v26M112 102c1.5-4 3.5-5.5 6-5.5s4.5 1.5 6 5.5M108 114l-7-4M108 122l-8 1M109 130l-6 6M128 114l7-4M128 122l8 1M127 130l6 6"/><circle cx="118" cy="90" r="3.5"/>
<path d="M178 150c-10-14-8-30 4-38 3 8 3 18-4 38zM186 150c10-14 8-30-4-38M170 128c-7 0-12 4-14 9 5 7 12 11 22 13M194 128c7 0 12 4 14 9-5 7-12 11-22 13M166 156h32"/>
<path d="M36 164v40M50 164v40M29 168h28M29 176h28M29 184h28M31 204h24"/>
<path d="M92 204l22-36 22 36zM114 168l6 36"/><circle cx="140" cy="176" r="5"/>
</g></svg>`;

const TONES = {
  royal:  ['#3B2A7A', '#1E1450'],
  lapis:  ['#1E3A8A', '#0F2160'],
  red:    ['#A4243B', '#5E1222'],
  gold:   ['#B8891E', '#6E4F0B'],
  copper: ['#7A4A2E', '#3F2414'],
};

/**
 * Illustrated placeholder tile for gallery categories that don't have real photos yet.
 * `symbol` = { attrs, inner } parsed from a sprite <symbol> (viewBox, fill/stroke attributes + inner markup).
 */
const placeholderSvg = (symbol, tone = 'royal') => {
  const [c1, c2] = TONES[tone] || TONES.royal;
  const pattern = encodeURIComponent(patternSvg('#E3B54A', 0.16));
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800" height="600" viewBox="0 0 800 600">
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
  <radialGradient id="glow" cx=".5" cy=".45" r=".5"><stop offset="0" stop-color="#E3B54A" stop-opacity=".35"/><stop offset="1" stop-color="#E3B54A" stop-opacity="0"/></radialGradient>
  <pattern id="p" width="220" height="220" patternUnits="userSpaceOnUse"><image width="220" height="220" xlink:href="data:image/svg+xml,${pattern}" href="data:image/svg+xml,${pattern}"/></pattern>
</defs>
<rect width="800" height="600" fill="url(#g)"/>
<rect width="800" height="600" fill="url(#p)"/>
<rect width="800" height="600" fill="url(#glow)"/>
<circle cx="400" cy="270" r="150" fill="none" stroke="#E3B54A" stroke-opacity=".55" stroke-width="3"/>
<circle cx="400" cy="270" r="132" fill="none" stroke="#E3B54A" stroke-opacity=".35" stroke-width="2" stroke-dasharray="4 7"/>
<svg x="310" y="180" width="180" height="180" ${symbol.attrs} color="#F3D06E">${symbol.inner}</svg>
<rect x="250" y="470" width="300" height="40" rx="20" fill="none" stroke="#E3B54A" stroke-opacity=".55" stroke-width="2.5"/>
<path d="M552 470v40" stroke="#E3B54A" stroke-opacity=".55" stroke-width="5"/>
<path d="M290 490h220" stroke="#F5ECD7" stroke-opacity=".35" stroke-width="3" stroke-dasharray="14 10"/>
</svg>`;
};

module.exports = { lotusColumn, wingedSun, rosetteDivider, patternSvg, placeholderSvg };
