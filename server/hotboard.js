import { webBoards } from '../src/data/hotBoards.js';

const endpoint = 'https://uapis.cn/api/v1/misc/hotboard';
const platforms = new Set(webBoards.map(({ id }) => id));
export const isWebBoard = (platform) => platforms.has(platform);

function metric(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 40);
}

export function createWebBoardReader() {
  const cache = new Map();
  return async function readWebBoard(platform) {
    const previous = cache.get(platform);
    if (previous?.pending) return previous.pending;
    if (previous?.until > Date.now()) return previous.result;
    const entry = { result: previous?.result };
    cache.set(platform, entry);
    entry.pending = (async () => {
      try {
        const response = await fetch(`${endpoint}?type=${platform}`, {
          headers: { Accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw Error('Hotboard unavailable');
        const data = await response.json();
        if (!Array.isArray(data?.list) || (data.type && data.type !== platform)) throw Error('Unexpected hotboard payload');
        const items = data.list.flatMap((item, index) => {
          const title = typeof item?.title === 'string' ? item.title.trim().slice(0, 240) : '';
          const link = typeof item?.url === 'string' ? URL.parse(item.url) : null;
          if (!title) return [];
          return [{
            title,
            rank: Number.isSafeInteger(item.index) && item.index > 0 ? item.index : index + 1,
            href: link && ['https:', 'http:'].includes(link.protocol) && !link.username && !link.password ? link.href : undefined,
            hot: metric(item.hot_value) ?? metric(item.extra?.hot_value),
            videos: metric(item.extra?.video_count),
            views: metric(item.extra?.view_count),
          }];
        }).slice(0, 20);
        if (!items.length && data.list.length) throw Error('Invalid hotboard items');
        const updatedAt = typeof data.update_time === 'string' && Number.isFinite(Date.parse(data.update_time)) ? data.update_time : undefined;
        entry.result = { state: 'ready', items, updatedAt };
        entry.until = Date.now() + 5 * 60_000;
      } catch {
        entry.result = entry.result?.items?.length ? { ...entry.result, state: 'stale' } : { state: 'unavailable' };
        entry.until = Date.now() + 60_000;
      } finally {
        entry.pending = null;
      }
      return entry.result;
    })();
    return entry.pending;
  };
}
