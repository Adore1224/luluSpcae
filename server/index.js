import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLabApi } from './api.js';
import { workbenchFrameOrigins } from './workbench.js';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 4178);
const host = process.env.HOST || '127.0.0.1';
const api = createLabApi();
const frameOrigins = workbenchFrameOrigins(process.env);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.avif': 'image/avif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};
const publicPage = /^\/(?:projects(?:\/[a-z0-9-]+)?|games|skills|aihot|about|explore(?:\/[a-z0-9-]+)?|workbench)?\/?$/;

async function serve(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (/^\/repositories\/?$/.test(path)) { res.writeHead(308, { Location: '/skills' }); res.end(); return; }
  const asset = path.startsWith('/assets/');
  const filename = asset ? resolve(root, `.${path}`) : resolve(root, 'index.html');
  if (asset && !filename.startsWith(`${resolve(root, 'assets')}${sep}`)) { res.writeHead(404); res.end(); return; }
  const file = await stat(filename).catch(() => null);
  if (!file?.isFile()) { res.writeHead(404); res.end(); return; }
  const privatePage = /^\/workbench\/?$/.test(path);
  const remoteImages = privatePage || /^\/projects(?:\/|$)/.test(path) ? ' https:' : '';
  const frames = privatePage && frameOrigins.length ? frameOrigins.join(' ') : "'none'";
  res.writeHead(asset || publicPage.test(path) ? 200 : 404, {
    'Content-Type': types[extname(filename)] ?? 'application/octet-stream',
    'Content-Length': file.size,
    'Cache-Control': asset ? 'public, max-age=31536000, immutable' : privatePage ? 'no-store' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:${remoteImages}; frame-src ${frames}; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`,
    ...(privatePage ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}),
  });
  if (req.method === 'HEAD') { res.end(); return; }
  const stream = createReadStream(filename);
  stream.on('error', () => res.destroy());
  res.on('close', () => stream.destroy());
  stream.pipe(res);
}

const build = await stat(resolve(root, 'index.html')).catch(() => null);
if (!build?.isFile()) throw new Error('Missing dist/index.html; run npm run build first.');
if (process.env.LAB_WORKBENCH_PASSPHRASE && !process.env.LAB_ORIGIN) throw new Error('Set LAB_ORIGIN to the browser-visible origin before configuring the workbench.');

createServer({ requestTimeout: 15_000, headersTimeout: 10_000 }, (req, res) => {
  api(req, res, () => { serve(req, res).catch(() => { if (!res.headersSent) res.writeHead(400); res.end(); }); });
}).listen(port, host, () => console.log(`LULU LAB listening on http://${host}:${port}`));
