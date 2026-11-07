import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defaultHome, homeFields } from '../src/data/labContent.js';

const HOUR = 60 * 60 * 1000;
const COOKIE = 'lululab_session';
const channels = {
  selected: '/api/v1/items?mode=selected&window=7d&limit=6',
  hot: '/api/v1/hot-topics',
};

function json(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(JSON.stringify(data));
}

function httpError(status, message) { return Object.assign(new Error(message), { status }); }

async function readJson(req) {
  if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw httpError(415, '请求格式不正确。');
  if (Number(req.headers['content-length']) > 4096) throw httpError(413, '提交的内容过长。');
  const chunks = [];
  let bytes = 0;
  // Keep the socket writable long enough to return a 413 for chunked uploads.
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    bytes += chunk.length;
    if (bytes > 4096) { req.resume(); throw httpError(413, '提交的内容过长。'); }
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw httpError(400, '请求内容无法读取。'); }
}

function validHome(input) {
  return Object.fromEntries(homeFields.map(({ key, label, max }) => {
    const value = typeof input?.[key] === 'string' ? input[key].trim().replace(/\s+/gu, ' ').replaceAll('实验室', '工作室') : '';
    if (!value || value.length > max || [...value].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) throw httpError(400, `${label}须为 1–${max} 个有效字符。`);
    return [key, value];
  }));
}

function webUrl(value, base) {
  try { const url = new URL(value, base); return typeof value === 'string' && value && ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; }
  catch { return undefined; }
}

function createNewsReader(env) {
  const base = new URL(env.AIHOT_BASE_URL || 'https://aihot.news');
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) throw new Error('AIHOT_BASE_URL must be an HTTP(S) origin without credentials.');
  const source = {
    name: env.AIHOT_SOURCE_NAME || (base.hostname === 'aihot.news' ? 'AIHOT' : base.hostname),
    home: base.origin,
    hot: new URL('/hot', base).href,
    project: 'https://github.com/KKKKhazix/AIHOT',
  };
  const entries = new Map();
  return async function news(channel) {
    if (env.AIHOT_ENABLED === 'false') return { state: 'disabled', source };
    const entry = entries.get(channel) ?? { due: 0 };
    entries.set(channel, entry);
    if (entry.pending) return entry.pending;
    if (Date.now() < entry.due) return entry.result;
    entry.pending = (async () => {
      let ttl = 60_000;
      try {
        const response = await fetch(new URL(channels[channel], base), {
          headers: { Accept: 'application/json', ...(entry.etag ? { 'If-None-Match': entry.etag } : {}) },
          signal: AbortSignal.timeout(6500), redirect: 'error',
        });
        const maxAge = Number(response.headers.get('cache-control')?.match(/\bs-maxage=(\d+)/i)?.[1]);
        if (Number.isFinite(maxAge)) ttl = Math.max(ttl, maxAge * 1000);
        const retryAfter = response.headers.get('retry-after');
        if (retryAfter) ttl = Math.max(ttl, /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - Date.now() || 0);
        if (response.status === 304 && entry.result?.state === 'ready') return entry.result;
        if (!response.ok) throw new Error('Upstream unavailable');
        const payload = await response.json();
        if (!Array.isArray(payload.items)) throw new Error('Unexpected upstream response');
        const items = payload.items.slice(0, channel === 'hot' ? 10 : 6).flatMap((item) => {
          const url = webUrl(item?.links?.aihot ?? item?.links?.story, base);
          if (!url || typeof item?.title !== 'string' || !item.title) return [];
          return [{ id: item.id || url, title: item.title, url, original: webUrl(item.links?.original, base), source: item.source?.name,
            summary: channel === 'selected' && typeof item.summary === 'string' ? item.summary.slice(0, 300) + (item.summary.length > 300 ? '…' : '') : undefined,
            attribution: item.attribution,
            date: item.timelineAt ?? item.publishedAt ?? item.latestAt ?? item.discoveredAt,
            rank: channel === 'hot' ? item.rank : undefined }];
        });
        entry.etag = response.headers.get('etag');
        entry.result = { state: 'ready', items, source };
      } catch {
        entry.etag = undefined;
        entry.result = { state: 'unavailable', source };
      } finally { entry.due = Date.now() + ttl; }
      return entry.result;
    })().finally(() => { entry.pending = null; });
    return entry.pending;
  };
}

export function createLabApi(env = process.env) {
  const dataDir = resolve(env.LAB_DATA_DIR || '.lab-data');
  const homeFile = resolve(dataDir, 'home.json');
  const secret = env.LAB_WORKBENCH_PASSPHRASE;
  const configured = typeof secret === 'string' && secret.length >= 16 && secret.length <= 256;
  const origin = env.LAB_ORIGIN ? new URL(env.LAB_ORIGIN).origin : null;
  const secure = origin?.startsWith('https://');
  const sessionTtl = HOUR * 4;
  const sessions = new Map();
  const failures = [];
  const readNews = createNewsReader(env);
  const cookie = (token, maxAge) => `${COOKIE}=${token}; Path=/api/workbench; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
  const getToken = (req) => req.headers.cookie?.match(/(?:^|;\s*)lululab_session=([\da-f]{64})(?:;|$)/)?.[1];
  const hash = (input) => createHash('sha256').update(input).digest();
  const secretHash = configured ? hash(secret) : null;

  async function readHome() {
    try { return validHome(JSON.parse(await readFile(homeFile, 'utf8'))); }
    catch (error) { if (error.code === 'ENOENT') return defaultHome; throw error; }
  }

  return async (req, res, next) => {
    const path = req.url.split('?')[0];
    if (!path.startsWith('/api/')) { next(); return; }
    const method = req.method;
    try {
      if (path === '/api/home' && method === 'GET') { json(res, 200, await readHome()); return; }
      const channel = path.startsWith('/api/aihot/') ? path.slice(11) : '';
      if (Object.hasOwn(channels, channel) && method === 'GET') { json(res, 200, await readNews(channel)); return; }
      if (path !== '/api/workbench/session' && path !== '/api/workbench/home') { json(res, 404, { message: '接口不存在。' }); return; }
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      const now = Date.now();
      const token = getToken(req);
      const unlocked = configured && token && (sessions.get(token) ?? 0) > now;
      if (method !== 'GET') {
        const requestOrigin = origin || `http://${req.headers.host}`;
        if (req.headers.origin !== requestOrigin || req.headers['sec-fetch-site'] === 'cross-site') throw httpError(403, '请从本站工作台操作。');
      }
      if (path === '/api/workbench/session') {
        if (method === 'GET') { json(res, 200, { configured, unlocked: Boolean(unlocked), ...(unlocked ? { home: await readHome() } : {}) }); return; }
        if (method === 'POST') {
          if (!configured) throw httpError(503, '工作台尚未配置私密口令。');
          while (failures.length && failures[0] <= now - 15 * 60_000) failures.shift();
          if (failures.length >= 8) { json(res, 429, { message: '尝试次数过多，请稍后再试。' }, { 'Retry-After': '900' }); return; }
          const { passphrase } = (await readJson(req)) ?? {};
          if (typeof passphrase !== 'string' || passphrase.length > 256 || !timingSafeEqual(hash(passphrase), secretHash)) {
            if (failures.length < 8) failures.push(now);
            throw httpError(401, '口令不正确。');
          }
          const home = await readHome();
          for (const [key, until] of sessions) if (until <= now) sessions.delete(key);
          if (token) sessions.delete(token);
          if (sessions.size >= 16) sessions.delete(sessions.keys().next().value);
          const newToken = randomBytes(32).toString('hex');
          sessions.set(newToken, now + sessionTtl);
          json(res, 200, { unlocked: true, home }, { 'Set-Cookie': cookie(newToken, sessionTtl / 1000) }); return;
        }
        if (method === 'DELETE') {
          if (token) sessions.delete(token);
          json(res, 200, { unlocked: false }, { 'Set-Cookie': cookie('', 0) }); return;
        }
      }
      if (path === '/api/workbench/home' && method === 'PUT') {
        if (!unlocked) throw httpError(401, '工作台已锁定，请重新解锁。');
        const home = validHome(await readJson(req));
        if ((sessions.get(token) ?? 0) <= Date.now()) throw httpError(401, '工作台已锁定，请重新解锁。');
        await mkdir(dataDir, { recursive: true, mode: 0o700 });
        const temp = resolve(dataDir, `.home-${randomBytes(8).toString('hex')}.tmp`);
        try { await writeFile(temp, `${JSON.stringify(home, null, 2)}\n`, { flag: 'wx', mode: 0o600 }); await rename(temp, homeFile); }
        finally { await rm(temp, { force: true }); }
        json(res, 200, { home }); return;
      }
      json(res, 405, { message: '此操作不受支持。' });
    } catch (error) {
      if (error.status) json(res, error.status, { message: error.message });
      else { console.error('Lab API:', error.code ?? error.name); json(res, 500, { message: '服务暂不可用，请稍后再试。' }); }
    }
  };
}
