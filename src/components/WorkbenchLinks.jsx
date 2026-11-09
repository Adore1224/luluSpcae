import { useEffect, useState } from 'react';
import { ArrowUpRight, Compass, Globe2, Plus, Star } from 'lucide-react';
import { api } from '../data/labApi';
import { matchSearch } from '../data/workbench';
import { DeskEmpty, ExternalLink, Search } from './WorkbenchUi';

export function Bookmarks({ items, openEditor, remove, busy }) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const groups = [...new Set(items.map(({ category }) => category).filter(Boolean))];
  const activeGroup = groups.includes(group) ? group : '';
  const filtered = items.filter((item) => (!activeGroup || item.category === activeGroup) && matchSearch(query, item.name, item.href, item.description, item.category))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  return <>
    <div className="desk-tools desk-bookmark-tools">
      <div className="desk-actions">
        <select aria-label="网站分组" value={activeGroup} onChange={(event) => setGroup(event.target.value)}><option value="">全部分组</option>{groups.map((category) => <option key={category}>{category}</option>)}</select>
        <Search label="搜索星标网站" value={query} onChange={setQuery} />
      </div>
      <button type="button" className="desk-button" onClick={() => openEditor('bookmarks')}><Plus size={16} /> 添加网站</button>
    </div>
    {filtered.length ? <div className="desk-card-grid">{filtered.map((item) => <article className="desk-panel desk-bookmark" key={item.id}>
      <a className="desk-card-open" href={item.href} target="_blank" rel="noreferrer">
        <div className="desk-row"><span className="desk-record-icon"><Globe2 size={19} /></span><ArrowUpRight size={18} /></div>
        <h2>{item.name}</h2><small>{new URL(item.href).host}</small><p>{item.description}</p>
      </a>
      <div className="desk-row">
        <div className="desk-actions">{item.category && <span className="desk-pill">{item.category}</span>}{item.pinned && <span className="desk-pill" data-live="true">置顶</span>}</div>
        <div className="desk-actions"><button type="button" className="desk-quiet" onClick={() => openEditor('bookmarks', item)}>编辑</button><button type="button" className="desk-quiet desk-danger" disabled={busy} onClick={() => remove('bookmarks', item)}>删除</button></div>
      </div>
    </article>)}</div> : <DeskEmpty icon={Star}>{query || activeGroup ? '没有匹配的网站。' : '添加常用网站，点击卡片就能在新标签页打开。'}</DeskEmpty>}
  </>;
}

const starCount = new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 });
const periods = [['1', '今天'], ['7', '本周'], ['30', '本月']];

export function GitHubDesk({ bookmarks, save, setMessage }) {
  const [trending, setTrending] = useState(true);
  const [searchMode, setSearchMode] = useState('created');
  const [days, setDays] = useState('30');
  const [trendingDays, setTrendingDays] = useState('1');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(null);
  const mode = trending ? 'trending' : searchMode;
  const range = trending ? trendingDays : days;
  const key = `${mode}:${range}:${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    api(`/api/workbench/github?${new URLSearchParams({ mode, days: range })}`, { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setResult({ key, ...data });
    }).catch((failure) => {
      if (!controller.signal.aborted) setResult({ key, state: 'unavailable', message: failure.message });
    });
    return () => controller.abort();
  }, [key, mode, range]);

  async function star(repo) {
    setSaving(repo.id);
    try { await save('bookmarks', { name: repo.name.slice(0, 100), href: repo.href, description: repo.description?.slice(0, 300), category: 'GitHub' }); }
    catch (failure) { setMessage(failure.message, true); }
    finally { setSaving(null); }
  }

  const active = result?.key === key ? result : null;
  const periodLabel = periods.find(([value]) => value === trendingDays)[1];
  return <>
    <nav className="desk-tabs" aria-label="开源热点榜单">
      <button type="button" aria-current={trending ? 'page' : undefined} onClick={() => setTrending(true)}>GitHub Trending</button>
      <button type="button" aria-current={!trending ? 'page' : undefined} onClick={() => setTrending(false)}>仓库热度</button>
    </nav>
    <div className="desk-tools">
      <div className="desk-actions">
        {trending ? <select aria-label="趋势榜时间范围" value={trendingDays} onChange={(event) => setTrendingDays(event.target.value)}>
          {periods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select> : <>
          <select aria-label="仓库范围" value={searchMode} onChange={(event) => setSearchMode(event.target.value)}><option value="created">近期新建</option><option value="pushed">近期有推送</option></select>
          <select aria-label="时间范围" value={days} onChange={(event) => setDays(event.target.value)}><option value="7">最近 7 天</option><option value="30">最近 30 天</option></select>
        </>}
      </div>
      {trending && <ExternalLink href={`https://github.com/trending?since=${{ 1: 'daily', 7: 'weekly', 30: 'monthly' }[trendingDays]}`}>查看原榜</ExternalLink>}
    </div>
    <p className="desk-source">{trending ? '来源为 GitHub Trending，沿用原榜顺序，分别展示新增与累计 Stars。'
      : `按最近 ${days} 天内${searchMode === 'created' ? '创建' : '推送'}筛选仓库，再按累计 Stars 排序。仅展示许可证可识别的仓库。`}
      {active?.updatedAt && ` · ${new Date(active.updatedAt).toLocaleString('zh-CN')} 更新`}</p>
    {active?.state === 'stale' && <p className="desk-feedback" role="status">当前展示上次成功更新的结果。</p>}
    {!active ? <DeskEmpty icon={Compass}>正在读取 GitHub 仓库…</DeskEmpty> : active.items?.length ? <ol className="desk-list desk-repos">{active.items.map((repo, index) => {
      const starred = bookmarks.some((item) => item.href === repo.href);
      return <li className="desk-panel desk-repo-row" key={repo.id}>
        <span className="desk-rank">{String(index + 1).padStart(2, '0')}</span>
        <div className="desk-record-copy">
          <h2><a href={repo.href} target="_blank" rel="noreferrer">{repo.name} <ArrowUpRight size={15} /></a></h2><p>{repo.description || '仓库暂无简介。'}</p>
          <div className="desk-actions">
            {trending && <span className="desk-pill" data-live="true"><Star size={13} /> {periodLabel}新增 {repo.periodStars.toLocaleString('zh-CN')}</span>}
            <span className="desk-pill"><Star size={13} /> 累计 {starCount.format(repo.stars)}</span>
            {repo.language && <span className="desk-pill">{repo.language}</span>}
            {repo.license && <span className="desk-pill">{repo.license}</span>}
          </div>
        </div>
        <button type="button" className="desk-quiet" disabled={starred || saving !== null} onClick={() => star(repo)}>{starred ? '已收藏' : saving === repo.id ? '正在收藏…' : '收藏'}</button>
      </li>;
    })}</ol> : <div className="desk-empty"><Compass size={24} /><p>{active.message || (active.state === 'unavailable' ? '暂时无法读取 GitHub。' : '当前范围内暂无结果。')}</p>
      {active.state === 'unavailable' && <button type="button" className="desk-quiet" onClick={() => setAttempt((n) => n + 1)}>重试</button>}
    </div>}
  </>;
}
