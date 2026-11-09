import { useEffect, useState } from 'react';
import { api } from './labApi';
import { games } from './labContent';
import { projects } from './siteContent';

export function deskProjects(records = []) {
  const overrides = new Map(records.map((record) => [record.id, record]));
  const builtIn = projects.map((source) => {
    const record = overrides.get(source.id);
    overrides.delete(source.id);
    return {
      ...source, published: true, ...record, gallery: record?.gallery ?? null, sourceBacked: true,
      originalCount: source.gallery?.length ?? 0,
    };
  });
  return [...builtIn, ...overrides.values()];
}

export function mergeCatalog(source, records = [], hidden = []) {
  const updates = new Map(records.map((item) => [item.id, item]));
  const merged = source.map((item) => {
    const update = updates.get(item.id);
    updates.delete(item.id);
    return update ? { ...item, ...update, gallery: update.gallery ?? item.gallery } : item;
  });
  return [...merged, ...updates.values()].filter((item) => !hidden.includes(item.id));
}

export function useCatalog(enabled) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    api('/api/catalog', { signal: controller.signal }).then((result) => {
      if (!controller.signal.aborted) setData(result);
    }).catch(() => {
      if (!controller.signal.aborted) setData({});
    });
    return () => controller.abort();
  }, [enabled]);
  return {
    loading: enabled && !data,
    projects: mergeCatalog(projects, data?.projects, data?.hiddenProjects),
    games: mergeCatalog(games, data?.games, data?.hiddenGames),
  };
}
