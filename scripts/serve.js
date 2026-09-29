#!/usr/bin/env node
'use strict';
/**
 * Tiny local server for /dist (no dependencies).
 *
 *   node scripts/serve.js            → http://localhost:4173
 *   node scripts/serve.js --watch    → rebuilds automatically when src/ changes
 *   PORT=8080 node scripts/serve.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ics': 'text/calendar; charset=utf-8',
};

function build() {
  try {
    execFileSync(process.execPath, [path.join(__dirname, 'build.js')], { stdio: 'inherit' });
  } catch {
    console.error('✖ Build failed — fix the error above; the server keeps running.');
  }
}

if (!fs.existsSync(path.join(DIST, 'index.html'))) build();

if (process.argv.includes('--watch')) {
  let timer;
  fs.watch(path.join(ROOT, 'src'), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 150);
  });
  console.log('👀 Watching src/ for changes…');
}

function send(req, res, status, file) {
  const type = TYPES[path.extname(file)] || 'application/octet-stream';
  const headers = { 'Content-Type': type, 'Cache-Control': 'no-cache' };
  // gzip text responses like production hosts do (keeps local Lighthouse runs realistic)
  if (/text|json|xml|svg|javascript|manifest/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(status, headers);
    fs.createReadStream(file).pipe(zlib.createGzip()).pipe(res);
    return;
  }
  res.writeHead(status, headers);
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(DIST, pathname);
    if (!file.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: `${pathname}/` }).end();
        return;
      }
      file = path.join(file, 'index.html');
    }
    if (fs.existsSync(file)) return send(req, res, 200, file);
    const lang = pathname.startsWith('/en') ? 'en' : pathname.startsWith('/ar') ? 'ar' : null;
    return send(req, res, 404, path.join(DIST, lang ? `${lang}/404.html` : '404.html'));
  })
  .listen(PORT, () => console.log(`\n🏛  Abnauona site running at http://localhost:${PORT}\n`));
