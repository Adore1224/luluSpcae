import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { notePaper } from '../src/data/workbench.js';

export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

const invalid = (label) => { throw httpError(400, `请检查${label}。`); };

function text(value, max, label, required = false) {
  const result = typeof value === 'string' ? value.trim() : '';
  if (result.length > max || (required && !result)) invalid(label);
  return result;
}

function url(value, label, protocols = ['https:', 'http:']) {
  const input = text(value, 1500, label);
  if (!input) return '';
  const parsed = URL.parse(input);
  if (!parsed || !protocols.includes(parsed.protocol) || parsed.username || parsed.password) invalid(label);
  return parsed.href;
}

function gallery(value) {
  if (value === null || value === undefined) return null;
  if (!Array.isArray(value) || value.length > 12) invalid('截图列表');
  return value.map((shot) => ({
    image: url(text(shot?.image, 1500, '截图地址', true), '截图地址', ['https:']),
    description: text(shot?.description, 240, '截图说明'),
  }));
}

function drawing(value) {
  if (!Array.isArray(value) || value.length > 60) invalid('草图笔画');
  return value.map((stroke) => {
    const { points, color, width } = stroke ?? {};
    if (!['#263a2d', '#b05d49', '#35689c'].includes(color) || ![2, 4, 7].includes(width) ||
      !Array.isArray(points) || points.length < 2 || points.length > 320 || points.length % 2 !== 0 ||
      points.some((n, i) => !Number.isInteger(n) || n < 0 || n > (i % 2 ? notePaper.height : notePaper.width))) invalid('草图坐标');
    return { points, color, width };
  });
}

function noteTextBlocks(value) {
  const { maxBlocks, maxText, maxTextX, maxTextY } = notePaper;
  if (!Array.isArray(value) || value.length > maxBlocks) invalid('画布文字');
  const blocks = value.map((block) => {
    const { x, y } = block ?? {};
    if (!Number.isInteger(x) || x < 0 || x > maxTextX || !Number.isInteger(y) || y < 0 || y > maxTextY) invalid('文字坐标');
    return { x, y, text: text(block.text, maxText, '画布文字') };
  });
  if (blocks.reduce((length, block) => length + block.text.length, 0) > maxText) invalid('画布文字长度');
  return blocks.filter((block) => block.text);
}

const slug = /^[a-z0-9][a-z0-9-]{0,63}$/;
const name = (data) => text(data?.name, 100, '名称', true);
const catalogFields = (data) => ({
  name: name(data),
  href: url(data?.href, '访问地址'),
  published: data?.published === true,
  sourceBacked: data?.sourceBacked === true,
});

const validators = {
  projects: (data) => ({
    ...catalogFields(data),
    projectType: text(data?.projectType, 30, '项目分类'),
    overview: text(data?.overview, 1800, '项目介绍', true),
    technologies: [...new Set(text(data?.technologies, 320, '技术栈').split(/[,，、]/).map((item) => item.trim()).filter(Boolean))],
    gallery: gallery(data?.gallery),
  }),
  games: (data) => ({
    ...catalogFields(data),
    description: text(data?.description, 1800, '游戏介绍', true),
  }),
  documents: (data) => ({
    name: name(data),
    description: text(data?.description, 300, '资料简介'),
    published: data?.published === true,
  }),
  'admin-links': (data) => ({
    name: name(data),
    href: url(text(data?.href, 1500, '后台地址', true), '后台地址'),
    description: text(data?.description, 300, '入口说明'),
    projectId: text(data?.projectId, 64, '关联项目'),
  }),
  bookmarks: (data) => ({
    name: name(data),
    href: url(text(data?.href, 1500, '网站地址', true), '网站地址'),
    description: text(data?.description, 300, '网站说明'),
    category: text(data?.category, 40, '分组'),
    pinned: data?.pinned === true,
  }),
  notes: (data) => ({
    name: name(data),
    body: text(data?.body, notePaper.maxText, '笔记正文'),
    drawing: drawing(data?.drawing),
    ...(data?.textBlocks === undefined ? {} : { textBlocks: noteTextBlocks(data.textBlocks) }),
  }),
};

export function workbenchRoute(path) {
  const match = /^\/api\/workbench\/([a-z-]+)(?:\/([a-z0-9-]+))?$/.exec(path);
  if (!match || !Object.hasOwn(validators, match[1]) || (match[2] && !slug.test(match[2]))) return null;
  return { kind: match[1], id: match[2] };
}

export async function writeJsonFile(directory, file, data) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temp = resolve(directory, `.workbench-${randomUUID()}.tmp`);
  try {
    await writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    await rename(temp, file);
  } finally {
    await rm(temp, { force: true });
  }
}

export function createWorkbenchStore(directory) {
  const fileFor = (kind) => resolve(directory, `workbench-${kind}.json`);
  const documentDirectory = resolve(directory, 'share-files');
  const documentPath = (key) => resolve(documentDirectory, key);
  let pending = Promise.resolve();

  async function read(kind) {
    try { return JSON.parse(await readFile(fileFor(kind), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  }

  function mutate(kind, id, input, remove, assertUnlocked, upload) {
    const fields = remove ? null : validators[kind](input);
    const operation = pending.then(async () => {
      assertUnlocked();
      const items = await read(kind);
      const existing = items.find((item) => item.id === id);
      if ((existing?.revision ?? null) !== (input?.revision ?? null)) throw httpError(409, '这条记录已有更新。请刷新列表后重试。');
      if (remove && !existing) throw httpError(404, '记录不存在。');
      if (!existing && items.length >= (kind === 'notes' ? 100 : 300)) throw httpError(400, '已达到此板块的记录上限。');
      const next = items.filter((item) => item.id !== id);
      const item = fields && { ...fields, id, revision: randomUUID(), updatedAt: new Date().toISOString() };
      if (kind === 'documents' && item) {
        if (upload) {
          item.file = { ...upload.info, key: item.revision };
          await mkdir(documentDirectory, { recursive: true, mode: 0o700 });
          try {
            await writeFile(documentPath(item.file.key), upload.bytes, { flag: 'wx', mode: 0o600 });
          } catch (error) {
            if (error.code !== 'EEXIST') await discardDocument(item.file.key);
            throw error;
          }
        } else if (existing?.file) item.file = existing.file;
        else throw httpError(400, '请选择要上传的 PDF 或 Markdown 文件。');
      }
      if (item) next.unshift(item);
      try { await writeJsonFile(directory, fileFor(kind), next); }
      catch (error) {
        if (upload) await discardDocument(item.file.key);
        throw error;
      }
      if (kind === 'documents' && existing?.file && (remove || upload)) await discardDocument(existing.file.key);
      return item;
    });
    pending = operation.catch(() => {});
    return operation;
  }

  async function discardDocument(key) {
    try { await rm(documentPath(key), { force: true }); }
    catch (error) { console.error('Share file cleanup:', error.code ?? error.name); }
  }

  async function publicDocuments() {
    return (await read('documents')).filter((item) => item.published).map(({ id, name, description, file }) => ({
      id, name, description, type: file.type, size: file.size, version: file.key,
    }));
  }

  async function publicCatalog() {
    const [projects, games] = await Promise.all([read('projects'), read('games')]);
    const published = (items) => items.filter((item) => item.published)
      .map(({ revision: _revision, updatedAt: _updatedAt, sourceBacked: _sourceBacked, ...item }) => item);
    const hidden = (items) => items.filter((item) => item.sourceBacked && !item.published).map(({ id }) => id);
    return {
      projects: published(projects),
      games: published(games),
      hiddenProjects: hidden(projects),
      hiddenGames: hidden(games),
    };
  }

  return { read, mutate, publicCatalog, publicDocuments, documentPath };
}

export function workbenchFrameOrigins(env) {
  return [...new Set((env.LAB_WORKBENCH_FRAME_ORIGINS ?? '').split(',').flatMap((value) => {
    const parsed = URL.parse(value.trim());
    return parsed && parsed.protocol === 'https:' && !parsed.username && !parsed.password &&
      parsed.pathname === '/' && !parsed.search && !parsed.hash &&
      parsed.origin !== URL.parse(env.LAB_ORIGIN ?? '')?.origin ? [parsed.origin] : [];
  }))];
}

const trendingPeriods = { 1: 'daily', 7: 'weekly', 30: 'monthly' };
const htmlEntities = { amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"' };

function trendingText(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (entity, code) => {
    if (code[0] !== '#') return Object.hasOwn(htmlEntities, code) ? htmlEntities[code] : entity;
    const hex = code[1].toLowerCase() === 'x';
    const value = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
    return value <= 0x10ffff ? String.fromCodePoint(value) : entity;
  }).replace(/\s+/g, ' ').trim();
}

async function readTrending(days) {
  const response = await fetch('https://github.com/trending?since=' + trendingPeriods[days], {
    headers: { Accept: 'text/html', 'Accept-Language': 'en', 'User-Agent': 'lululab-workbench' },
    redirect: 'error',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw Error('GitHub Trending unavailable');
  const html = await response.text();
  const items = [];
  // Read public repository rows in GitHub's order. The search API has a separate ranking.
  for (const [, row] of html.matchAll(/<article\b[^>]*class="[^"]*\bBox-row\b[^"]*"[^>]*>([\s\S]*?)<\/article>/g)) {
    const name = row.match(/<h2\b[^>]*>\s*<a\b[^>]*href="\/([a-z0-9_.-]+\/[a-z0-9_.-]+)"/i)?.[1];
    const stars = row.match(/href="\/[^"]+\/stargazers"[^>]*>([\s\S]*?)<\/a>/i)?.[1];
    const periodStars = row.match(/([\d,]+)\s+stars?\s+(?:today|this week|this month)\b/i)?.[1];
    if (!name || !stars || !periodStars) continue;
    const total = Number(trendingText(stars).replaceAll(',', ''));
    const gained = Number(periodStars.replaceAll(',', ''));
    if (!Number.isFinite(total) || !Number.isFinite(gained)) continue;
    items.push({
      id: name,
      name,
      href: 'https://github.com/' + name,
      description: trendingText(row.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1]),
      language: trendingText(row.match(/<span\b[^>]*itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/i)?.[1]),
      stars: total,
      periodStars: gained,
    });
  }
  if (!items.length) throw Error('GitHub Trending layout unavailable');
  return items;
}

export function createGitHubReader(env) {
  const cache = new Map();
  return async function readGitHub(params) {
    const requestedMode = params.get('mode');
    const mode = requestedMode === 'trending' || requestedMode === 'pushed' ? requestedMode : 'created';
    const requestedDays = params.get('days');
    const days = requestedDays === '7' ? 7 : mode === 'trending' && requestedDays !== '30' ? 1 : 30;
    const key = `${mode}:${days}`;
    const previous = cache.get(key);
    if (previous?.pending) return previous.pending;
    if (previous?.until > Date.now()) return previous.result;
    const entry = { result: previous?.result };
    cache.set(key, entry);
    entry.pending = (async () => {
      try {
        const items = mode === 'trending' ? await readTrending(days) : await searchRepositories(mode, days);
        entry.result = { state: 'ready', items, updatedAt: new Date().toISOString() };
        entry.until = Date.now() + 10 * 60_000;
      } catch {
        entry.result = entry.result?.items ? { ...entry.result, state: 'stale' } : { state: 'unavailable' };
        entry.until = Date.now() + 60_000;
      } finally {
        entry.pending = null;
      }
      return entry.result;
    })();
    return entry.pending;
  };

  async function searchRepositories(mode, days) {
    const since = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
    const search = new URL('https://api.github.com/search/repositories');
    search.search = new URLSearchParams({
      q: `is:public fork:false archived:false ${mode}:>=${since} stars:>=10`,
      sort: 'stars', order: 'desc', per_page: '40',
    });
    const response = await fetch(search, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'lululab-workbench',
        ...(env.LAB_GITHUB_TOKEN ? { Authorization: `Bearer ${env.LAB_GITHUB_TOKEN}` } : {}),
      },
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw Error('GitHub search unavailable');
    const payload = await response.json();
    return payload.items.filter((item) =>
      item.license?.spdx_id && item.license.spdx_id !== 'NOASSERTION' &&
      URL.parse(item.html_url)?.origin === 'https://github.com'
    ).slice(0, 16).map((item) => ({
      id: item.id, name: item.full_name, href: item.html_url, description: item.description,
      stars: item.stargazers_count, language: item.language, license: item.license.spdx_id,
    }));
  }
}
