import { lazy, Suspense, useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SharePdf = lazy(() => import('./SharePdf'));

function MarkdownReader({ url }) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal, cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Markdown unavailable');
        return response.text();
      })
      .then((markdown) => { if (!controller.signal.aborted) setResult({ markdown }); })
      .catch(() => { if (!controller.signal.aborted) setResult({ error: true }); });
    return () => controller.abort();
  }, [url]);

  if (!result) return <p role="status">正在读取文档…</p>;
  if (result.error) return <p role="alert">文档暂时无法预览。请刷新页面或下载原文件。</p>;
  return <article className="share-markdown">
    <Markdown remarkPlugins={[remarkGfm]} skipHtml>{result.markdown}</Markdown>
  </article>;
}

export default function ShareReader({ type, url }) {
  if (type !== 'pdf') return <MarkdownReader url={url} />;
  return <Suspense fallback={<p role="status">正在加载 PDF 阅读器…</p>}><SharePdf url={url} /></Suspense>;
}
