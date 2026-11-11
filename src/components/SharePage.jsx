import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Download, FileText } from 'lucide-react';
import { exploreLibrary } from '../data/exploreLibrary';
import { api } from '../data/labApi';
import './Share.css';

const ShareReader = lazy(() => import('./ShareReader'));

function sizeLabel(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}

export default function SharePage({ documentId }) {
  const [data, setData] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api('/api/share', { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setData(Array.isArray(result.items) ? result : { error: true });
      })
      .catch(() => { if (!controller.signal.aborted) setData({ error: true }); });
    return () => controller.abort();
  }, [attempt]);

  const status = !data ? <p role="status">正在读取分享资料…</p> : data.error ? <div className="share-status">
    <p role="status">暂时无法读取已上传的资料。</p>
    <button type="button" className="lab-plain" onClick={() => { setData(null); setAttempt((n) => n + 1); }}>重试</button>
  </div> : null;

  if (documentId) {
    const item = data?.items?.find(({ id }) => id === documentId);
    const fileUrl = item && `/api/share/${documentId}/file?v=${encodeURIComponent(item.version)}`;
    return <main id="main-content" className="lab-page share-page">
      <a className="lab-link share-back" href="/share"><ArrowLeft size={16} /> 返回分享</a>
      {status ?? (item ? <>
        <header className="share-reader-heading">
          <div><span className="share-format">{item.type === 'pdf' ? 'PDF' : 'Markdown'} · {sizeLabel(item.size)}</span>
            <h1>{item.name}</h1>{item.description && <p>{item.description}</p>}</div>
          <a className="lab-button" href={fileUrl} download><Download size={16} /> 下载原文件</a>
        </header>
        <Suspense fallback={<p role="status">正在加载阅读器…</p>}>
          <ShareReader key={item.id} type={item.type} url={fileUrl} />
        </Suspense>
      </> : <div className="lab-empty"><h1>资料未找到</h1><p>这份资料可能已下架。</p></div>)}
    </main>;
  }

  return <main id="main-content" className="lab-page share-page">
    <header className="lab-page-heading"><h1>分享<i>.</i></h1></header>
    {status}
    <ul className="share-grid">
      {data?.items?.map((item) => <li key={item.id}><a className="share-card" href={`/share/${item.id}`}>
        <span className="share-card-meta"><FileText size={19} aria-hidden="true" /><span>{item.type === 'pdf' ? 'PDF' : 'Markdown'} · {sizeLabel(item.size)}</span></span>
        <h2>{item.name}</h2>{item.description && <p>{item.description}</p>}
        <span className="share-card-action">在线阅读 <ArrowRight size={16} aria-hidden="true" /></span>
      </a></li>)}
      {exploreLibrary.map((guide) => <li key={guide.path}><a className="share-card" href={guide.path}>
        <span className="share-card-meta"><BookOpen size={19} aria-hidden="true" /><span>{guide.duration}</span></span>
        <h2>{guide.title.replaceAll('\n', '')}</h2><p>{guide.summary}</p>
        <span className="share-card-action">在线阅读 <ArrowRight size={16} aria-hidden="true" /></span>
      </a></li>)}
    </ul>
  </main>;
}
