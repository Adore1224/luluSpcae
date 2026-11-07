import { useEffect, useState } from 'react';
import { ArrowUpRight, LockKeyhole, Radio, RefreshCw } from 'lucide-react';
import { defaultHome, homeFields } from '../data/labContent';
import LabCategoryNav from './LabCategoryNav';

const channels = {
  selected: { title: '精选', detail: '最近七天的编辑精选', href: 'https://aihot.news/' },
  hot: { title: '热点榜', detail: '多来源聚合的当前热点', href: 'https://aihot.news/hot' },
};

async function api(path, options) {
  const response = await fetch(path, { cache: 'no-store', ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(payload.message || '服务暂不可用，请稍后再试。'), { status: response.status });
  return payload;
}

export function NewsPage() {
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
  return <main id="main-content" className="lab-page">
    <header className="lab-page-heading"><p className="lab-kicker"><span />04 / AI RADAR</p><h1>AIHot<i>.</i></h1><p>一份简洁的 AI 资讯索引，沿着标题和摘要，回到消息的出处。</p></header>
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
  </main>;
}

const sendJson = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export function Workbench() {
  const [access, setAccess] = useState('checking');
  const [passphrase, setPassphrase] = useState('');
  const [published, setPublished] = useState(defaultHome);
  const [draft, setDraft] = useState(defaultHome);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const changed = homeFields.some(({ key }) => draft[key] !== published[key]);

  useEffect(() => {
    const controller = new AbortController();
    api('/api/workbench/session', { signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      setAccess(data.unlocked ? 'unlocked' : data.configured ? 'locked' : 'unconfigured');
      if (data.home) { setPublished(data.home); setDraft(data.home); }
    }).catch(() => { if (!controller.signal.aborted) setAccess('offline'); });
    return () => controller.abort();
  }, []);

  async function unlock(event) {
    event.preventDefault(); setPending(true); setMessage('');
    try {
      const data = await api('/api/workbench/session', sendJson('POST', { passphrase }));
      setPassphrase(''); setPublished(data.home); setDraft(data.home); setAccess('unlocked');
    } catch (error) { setMessage(error.message); }
    finally { setPending(false); }
  }

  async function publish(event) {
    event.preventDefault(); setPending(true); setMessage('');
    try {
      const data = await api('/api/workbench/home', sendJson('PUT', draft));
      setPublished(data.home); setDraft(data.home); setMessage('已发布，访客刷新首页即可看到修改。');
    } catch (error) {
      if (error.status === 401) setAccess('locked');
      setMessage(error.message);
    } finally { setPending(false); }
  }

  async function lock() {
    setPending(true); setMessage('');
    try { await api('/api/workbench/session', { method: 'DELETE' }); setAccess('locked'); setDraft(defaultHome); }
    catch (error) { setMessage(error.message); }
    finally { setPending(false); }
  }

  return <main id="main-content" className="lab-page lab-workbench">
    <header className="lab-page-heading"><p className="lab-kicker"><span />PRIVATE / OWNER ONLY</p><h1>个人工作台<i>.</i></h1><p>管理公开首页的站点介绍、标语与近况。</p></header>
    {access === 'unlocked' ? <div className="lab-work-grid">
      <form className="lab-panel lab-form" onSubmit={publish}><h2>编辑首页</h2>{homeFields.map(({ key, label, max }) => <label key={key}>{label}<span>{draft[key].length}/{max}</span>
        {key === 'description' ? <textarea rows="4" value={draft[key]} required maxLength={max} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} /> : <input value={draft[key]} required maxLength={max} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />}
      </label>)}<div className="lab-card-links"><button className="lab-button" disabled={!changed || pending}>{pending ? '处理中…' : '发布到首页'}</button><button type="button" className="lab-plain" disabled={!changed || pending} onClick={() => { setDraft(published); setMessage(''); }}>撤销未发布修改</button></div>
      <p role="status">{message}</p></form>
      <aside className="lab-panel lab-work-preview"><p className="lab-kicker">PREVIEW / {changed ? '未发布' : '已发布'}</p><p>{draft.eyebrow}</p><strong>LULU LAB.</strong><h2>{draft.headline}</h2><p>{draft.description}</p><small>{draft.status}</small><div className="lab-card-links"><a className="lab-link" href="/" target="_blank" rel="noreferrer">打开首页 <ArrowUpRight size={16} /></a><button type="button" className="lab-plain" onClick={lock} disabled={pending}><LockKeyhole size={16} /> 锁定工作台</button></div></aside>
    </div> : <div className="lab-panel lab-lock"><LockKeyhole size={29} /><h2>工作台已锁定</h2>
      {access === 'locked' ? <form className="lab-form" onSubmit={unlock}><label>私密口令<input type="password" autoComplete="current-password" required maxLength={256} value={passphrase} onChange={(event) => setPassphrase(event.target.value)} /></label><button className="lab-button" disabled={pending}>{pending ? '正在验证…' : '解锁工作台'}</button></form> : <p role="status">{access === 'checking' ? '正在检查工作台状态…' : access === 'unconfigured' ? '工作台尚未配置私密口令。' : '工作台暂不可用，请确认服务端已启动。'}</p>}
      {message && <p role="status">{message}</p>}
    </div>}
  </main>;
}
