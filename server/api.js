import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defaultHome, homeFields } from '../src/data/labContent.js';
import { shareLimits } from '../src/data/workbench.js';
import { createGitHubReader, createWorkbenchStore, httpError, workbenchFrameOrigins, workbenchRoute, writeJsonFile } from './workbench.js';
import { parseShareForm, sendSharedFile } from './share.js';

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

async function readBody(req, limit) {
  if (Number(req.headers['content-length']) > limit) throw httpError(413, '提交的内容过长。');
  const chunks = [];
  let bytes = 0;
  // Keep the socket writable long enough to return a 413 for chunked uploads.
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    bytes += chunk.length;
    if (bytes > limit) { req.resume(); throw httpError(413, '提交的内容过长。'); }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, bytes);
}

async function readJson(req, limit = 4096) {
  if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw httpError(415, '请求格式不正确。');
  const body = await readBody(req, limit);
  try { return JSON.parse(body.toString('utf8')); }
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
  const workbench = createWorkbenchStore(dataDir);
  const readGitHub = createGitHubReader(env);
  const frameOrigins = workbenchFrameOrigins(env);
  const cookie = (token, maxAge) => `${COOKIE}=${token}; Path=/api/workbench; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
  const getToken = (req) => req.headers.cookie?.match(/(?:^|;\s*)lululab_session=([\da-f]{64})(?:;|$)/)?.[1];
  const hash = (input) => createHash('sha256').update(input).digest();
  const secretHash = configured ? hash(secret) : null;

  async function readHome() {
    try { return validHome(JSON.parse(await readFile(homeFile, 'utf8'))); }
    catch (error) { if (error.code === 'ENOENT') return defaultHome; throw error; }
  }

  return async (req, res, next) => {
    const [path, query] = req.url.split('?', 2);
    if (!path.startsWith('/api/')) { next(); return; }
    const method = req.method;
    try {
      if (path === '/api/home' && method === 'GET') { json(res, 200, await readHome()); return; }
      if (path === '/api/catalog' && method === 'GET') { json(res, 200, await workbench.publicCatalog()); return; }
      if (path === '/api/share' && method === 'GET') { json(res, 200, { items: await workbench.publicDocuments() }); return; }
      const shareFile = /^\/api\/share\/([a-z0-9][a-z0-9-]{0,63})\/file$/.exec(path);
      if (shareFile && (method === 'GET' || method === 'HEAD')) {
        const item = (await workbench.read('documents')).find((entry) => entry.id === shareFile[1] && entry.published);
        if (!item) throw httpError(404, '资料未发布或已下架。');
        const version = new URLSearchParams(query).get('v');
        if (version && item.file.key !== version) throw httpError(409, '资料已更新，请刷新页面。');
        await sendSharedFile(req, res, item.file, workbench.documentPath(item.file.key));
        return;
      }
      const channel = path.startsWith('/api/aihot/') ? path.slice(11) : '';
      if (Object.hasOwn(channels, channel) && method === 'GET') { json(res, 200, await readNews(channel)); return; }
      const resource = workbenchRoute(path);
      if (!resource && !['/api/workbench/session', '/api/workbench/home', '/api/workbench/github'].includes(path)) { json(res, 404, { message: '接口不存在。' }); return; }
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      const now = Date.now();
      const token = getToken(req);
      const unlocked = configured && token && (sessions.get(token) ?? 0) > now;
      const assertUnlocked = () => {
        if (!configured || !token || (sessions.get(token) ?? 0) <= Date.now()) throw httpError(401, '工作台已锁定，请重新解锁。');
      };
      if (method !== 'GET') {
        const requestOrigin = origin || `http://${req.headers.host}`;
        if (req.headers.origin !== requestOrigin || req.headers['sec-fetch-site'] === 'cross-site') throw httpError(403, '请从本站工作台操作。');
      }
      if (path === '/api/workbench/session') {
        if (method === 'GET') { json(res, 200, { configured, unlocked: Boolean(unlocked), ...(unlocked ? { home: await readHome(), frameOrigins } : {}) }); return; }
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
          json(res, 200, { unlocked: true, home, frameOrigins }, { 'Set-Cookie': cookie(newToken, sessionTtl / 1000) }); return;
        }
        if (method === 'DELETE') {
          if (token) sessions.delete(token);
          json(res, 200, { unlocked: false }, { 'Set-Cookie': cookie('', 0) }); return;
        }
      }
      if (path !== '/api/workbench/session') assertUnlocked();
      if (path === '/api/workbench/home' && method === 'PUT') {
        const home = validHome(await readJson(req));
        assertUnlocked();
        await writeJsonFile(dataDir, homeFile, home);
        json(res, 200, { home }); return;
      }
      if (path === '/api/workbench/github' && method === 'GET') {
        json(res, 200, await readGitHub(new URLSearchParams(query))); return;
      }
      if (resource) {
        const { kind, id } = resource;
        if (!id && method === 'GET') {
          json(res, 200, { items: await workbench.read(kind) }); return;
        }
        if (id && (method === 'PUT' || method === 'DELETE')) {
          let input, upload;
          if (kind === 'documents' && method === 'PUT') {
            const type = req.headers['content-type'];
            if (type?.split(';')[0].trim() !== 'multipart/form-data') throw httpError(415, '请选择文件上传。');
            ({ fields: input, upload } = await parseShareForm(type, await readBody(req, shareLimits.pdf + 64 * 1024)));
          } else {
            input = await readJson(req, method === 'DELETE' ? 4096 : kind === 'notes' ? 256 * 1024 : 64 * 1024);
          }
          const item = await workbench.mutate(kind, id, input, method === 'DELETE', assertUnlocked, upload);
          json(res, 200, { item }); return;
        }
      }
      json(res, 405, { message: '此操作不受支持。' });
    } catch (error) {
      if (res.destroyed || res.headersSent) return;
      if (error.status) json(res, error.status, { message: error.message });
      else { console.error('Lab API:', error.code ?? error.name); json(res, 500, { message: '服务暂不可用，请稍后再试。' }); }
    }
  };
}
