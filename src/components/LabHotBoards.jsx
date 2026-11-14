import { useEffect, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { webBoards } from '../data/hotBoards';
import { api, sendJson } from '../data/labApi';
import LabCategoryNav from './LabCategoryNav';

const gitBoards = [{ id: 'trending', label: 'GitHub Trending' }, { id: 'search', label: '仓库热度' }];
const periods = [
  { days: '1', label: '日榜', since: 'daily', gained: '今日' },
  { days: '7', label: '周榜', since: 'weekly', gained: '本周' },
  { days: '30', label: '月榜', since: 'monthly', gained: '本月' },
];
const number = new Intl.NumberFormat('zh-CN');
const compact = new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 });
const timestamp = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Shanghai' });

function useBoard(path) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    api(path, { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setState({ path, attempt, data });
    }).catch(() => {
      if (!controller.signal.aborted) setState({ path, attempt, data: { state: 'unavailable' } });
    });
    return () => controller.abort();
  }, [path, attempt]);
  return [state?.path === path && state.attempt === attempt ? state.data : null, () => setAttempt((value) => value + 1)];
}

function BoardItems({ result, retry, children }) {
  if (!result) return <p className="lab-empty" role="status">正在读取榜单…</p>;
  if (result.state === 'unavailable') return <div className="lab-empty lab-news-empty">
    <h2>暂时无法读取榜单</h2><button type="button" className="lab-button" onClick={retry}><RefreshCw size={16} /> 重试</button>
  </div>;
  if (!result.items?.length) return <p className="lab-empty" role="status">当前榜单暂无内容。</p>;
  return <>
    {result.state === 'stale' && <p className="lab-hot-status" role="status">正在展示上次成功更新的榜单。</p>}
    <ol className="lab-news-list lab-hot-list">{children}</ol>
  </>;
}

function RankRow({ rank, title, href, children }) {
  return <li>
    <span className="lab-news-number">{String(rank).padStart(2, '0')}</span>
    <div>
      <h2>{href ? <a href={href} target="_blank" rel="noreferrer">{title}<ArrowUpRight size={15} aria-hidden="true" /></a> : title}</h2>
      {children}
    </div>
  </li>;
}

function TimeStamp({ value }) {
  return value && <time dateTime={value}>{timestamp.format(new Date(value))} 更新</time>;
}

export function GitHotPanel() {
  const [board, setBoard] = useState('trending');
  const [searchMode, setSearchMode] = useState('created');
  const [days, setDays] = useState('30');
  const [trendingDays, setTrendingDays] = useState('1');
  const [bookmarks, setBookmarks] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const trending = board === 'trending';
  const period = periods.find((option) => option.days === trendingDays);
  const [result, retry] = useBoard(`/api/hot/github?${new URLSearchParams({
    mode: trending ? 'trending' : searchMode, days: trending ? trendingDays : days,
  })}`);

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    api('/api/workbench/session', options).then(({ unlocked }) => unlocked && api('/api/workbench/bookmarks', options))
      .then((data) => {
        if (data && !controller.signal.aborted) setBookmarks(data.items.map(({ href }) => href));
      }).catch(() => {});
    return () => controller.abort();
  }, []);

  async function star(repo) {
    setSaving(true);
    setMessage('');
    try {
      await api(`/api/workbench/bookmarks/${crypto.randomUUID()}`, sendJson('PUT', {
        name: repo.name.slice(0, 100), href: repo.href, description: repo.description?.slice(0, 300), category: 'GitHub',
      }));
      setBookmarks((current) => [...current, repo.href]);
      setMessage('已加入星标网站。');
    } catch (error) { setMessage(error.message); }
    finally { setSaving(false); }
  }

  return <div className="lab-catalog-layout">
    <LabCategoryNav caption="GIT" label="Git 榜单" value={board} onChange={setBoard} items={gitBoards} />
    <section className="lab-news-channel" aria-label={trending ? 'GitHub Trending' : '仓库热度'}>
      <div className="lab-news-bar">
        <div className="lab-hot-controls">
          {trending ? <select aria-label="趋势榜时间范围" value={trendingDays} onChange={(event) => setTrendingDays(event.target.value)}>
            {periods.map(({ days: value, label }) => <option key={value} value={value}>{label}</option>)}
          </select> : <>
            <select aria-label="仓库范围" value={searchMode} onChange={(event) => setSearchMode(event.target.value)}>
              <option value="created">近期新建</option><option value="pushed">近期有推送</option>
            </select>
            <select aria-label="时间范围" value={days} onChange={(event) => setDays(event.target.value)}>
              <option value="7">最近 7 天</option><option value="30">最近 30 天</option>
            </select>
          </>}
        </div>
        {trending && <a className="lab-link" href={`https://github.com/trending?since=${period.since}`} target="_blank" rel="noreferrer">查看原榜 <ArrowUpRight size={16} /></a>}
      </div>
      <div className="lab-hot-metadata">
        <p>{trending ? '沿用 GitHub Trending 原榜顺序，展示新增和累计 Stars。'
          : `筛选最近 ${days} 天内${searchMode === 'created' ? '新建' : '有推送'}且许可证可识别的仓库，按累计 Stars 排序。`}</p>
        <TimeStamp value={result?.updatedAt} />
      </div>
      {message && <p className="lab-hot-status" role="status">{message}</p>}
      <BoardItems {...{ result, retry }}>
        {result?.items?.map((repo, index) => {
          const starred = bookmarks?.includes(repo.href);
          return <RankRow key={repo.id} rank={index + 1} title={repo.name} href={repo.href}>
            {repo.description && <p>{repo.description}</p>}
            <div className="lab-hot-metrics">
              {trending && <span>{period.gained}新增 {number.format(repo.periodStars)} Stars</span>}
              <span>累计 {compact.format(repo.stars)} Stars</span>
              {repo.language && <span>{repo.language}</span>}
              {repo.license && <span>{repo.license}</span>}
              {bookmarks && <button className="lab-plain" type="button" disabled={starred || saving} onClick={() => star(repo)}>
                {starred ? '已收藏' : '收藏'}
              </button>}
            </div>
          </RankRow>;
        })}
      </BoardItems>
    </section>
  </div>;
}

function WebMetric({ label, value }) {
  if (value === undefined) return null;
  const parsed = typeof value === 'number' || /^\d+$/.test(value) ? Number(value) : NaN;
  return <span>{label} {Number.isFinite(parsed) ? number.format(parsed) : value}</span>;
}

export function WebHotPanel() {
  const [platform, setPlatform] = useState(webBoards[0].id);
  const current = webBoards.find(({ id }) => id === platform);
  const [result, retry] = useBoard(`/api/hot/web/${platform}`);
  return <div className="lab-catalog-layout">
    <LabCategoryNav caption="PLATFORMS" label="网络热榜平台" value={platform} onChange={setPlatform} items={webBoards} />
    <section className="lab-news-channel" aria-label={current.label}>
      <div className="lab-news-bar">
        <div className="lab-hot-controls">
          <h2>{current.label}</h2>
          <TimeStamp value={result?.updatedAt} />
        </div>
        {result?.state !== 'unavailable' && <button type="button" className="lab-plain" disabled={!result} onClick={retry}><RefreshCw size={16} /> 刷新榜单</button>}
      </div>
      <BoardItems {...{ result, retry }}>
        {result?.items?.map((item, index) => <RankRow key={index} rank={item.rank} title={item.title} href={item.href}>
          <div className="lab-hot-metrics">
            <WebMetric label="热度" value={item.hot} />
            <WebMetric label="视频数" value={item.videos} />
            <WebMetric label="播放 / 浏览" value={item.views} />
          </div>
        </RankRow>)}
      </BoardItems>
      <div className="lab-news-source"><span>数据来源 <a href="https://uapis.cn/docs/api-reference/get-misc-hotboard" target="_blank" rel="noreferrer">UAPI 热榜 ↗</a></span></div>
    </section>
  </div>;
}
