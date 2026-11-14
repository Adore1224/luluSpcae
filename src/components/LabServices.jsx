import { useEffect, useState } from 'react';
import { ArrowUpRight, Radio, RefreshCw } from 'lucide-react';
import { api } from '../data/labApi';
import LabCategoryNav from './LabCategoryNav';

const channels = {
  selected: { title: '精选', detail: '最近七天的编辑精选', href: 'https://aihot.news/' },
  hot: { title: '热点榜', detail: '多来源聚合的当前热点', href: 'https://aihot.news/hot' },
};

export function AiHotPanel() {
  const [channel, setChannel] = useState('selected');
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api(`/api/aihot/${channel}`, { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setResult({ channel, attempt, ...data });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ channel, attempt, state: 'unavailable' });
    });
    return () => controller.abort();
  }, [channel, attempt]);
  const active = result?.channel === channel && result.attempt === attempt ? result : null;
  const current = channels[channel];
  const source = active?.source;
  const channelUrl = channel === 'hot' ? source?.hot ?? current.href : source?.home ?? current.href;
  return <>
    <div className="lab-catalog-layout"><LabCategoryNav caption="CHANNELS" label="资讯频道" value={channel} onChange={setChannel} items={Object.entries(channels).map(([id, item]) => ({ id, label: item.title, detail: id === 'hot' ? 'Trending / Top 10' : 'Selected / Last 7 days' }))} />
    <section className="lab-news-channel" aria-label={current.title}>
    <div className="lab-news-bar"><span>{current.detail}</span><a className="lab-link" href={channelUrl} target="_blank" rel="noreferrer">前往 {source?.name ?? 'AIHOT'} · {current.title} <ArrowUpRight size={16} /></a></div>
    {!active ? <p className="lab-empty" role="status">正在读取资讯…</p> : active.state !== 'ready' || !active.items?.length ? <div className="lab-empty lab-news-empty">
      <Radio size={30} /><h2>{active.state === 'disabled' ? '在 AIHOT 阅读' : active.state === 'ready' ? '这个频道暂无内容' : '暂时无法获取资讯'}</h2><p>{active.state === 'disabled' ? '可从上方打开官方频道。' : '你也可以直接前往官方频道查看。'}</p>
      {active.state === 'unavailable' && <button className="lab-button" onClick={() => setAttempt((i) => i + 1)}><RefreshCw size={16} /> 重试</button>}
    </div> : <ol className="lab-news-list">{active.items.map((item, i) => <li key={item.id}>
      <span className="lab-news-number">{String(item.rank ?? i + 1).padStart(2, '0')}</span><div><p className="lab-kicker">{item.source || 'AIHOT'}{item.date && ` / ${item.date.slice(0, 10)}`}</p><h2><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></h2>{item.summary && <p>{item.summary}</p>}<div className="lab-card-links"><a className="lab-link" href={item.url} target="_blank" rel="noreferrer">AIHOT 阅读页 <ArrowUpRight size={15} /></a>{item.original && <a className="lab-link" href={item.original} target="_blank" rel="noreferrer">原文 <ArrowUpRight size={15} /></a>}</div></div>
    </li>)}</ol>}
    <div className="lab-news-source"><span>项目来源 <a href="https://github.com/KKKKhazix/AIHOT" target="_blank" rel="noreferrer">KKKKhazix / AIHOT ↗</a></span><span>内容来源 <a href={source?.home ?? 'https://aihot.news'} target="_blank" rel="noreferrer">{source?.name ?? 'AIHOT'} ↗</a></span><span>摘要仅供浏览，完整内容见原文。</span></div>
    </section></div>
  </>;
}
