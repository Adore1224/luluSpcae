import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;
const assets = `/assets/pdfjs-${version}/`;

export default function SharePdf({ url }) {
  const [pdf, setPdf] = useState(null);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(0);
  const [error, setError] = useState('');
  const [rendering, setRendering] = useState(true);
  const surface = useRef(null);

  useEffect(() => {
    const task = getDocument({
      url, disableRange: true,
      cMapUrl: assets + 'cmaps/', standardFontDataUrl: assets + 'standard_fonts/',
      iccUrl: assets + 'iccs/', wasmUrl: assets + 'wasm/',
    });
    let active = true;
    task.promise.then((document) => { if (active) setPdf(document); }).catch((failure) => {
      if (active) setError(failure.name === 'PasswordException'
        ? '这份 PDF 需要密码，请下载原文件后打开。' : 'PDF 无法预览，请下载原文件后打开。');
    });
    return () => { active = false; void task.destroy().catch(() => {}); };
  }, [url]);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(surface.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdf || !width) return;
    const host = surface.current;
    let active = true;
    let task;
    setRendering(true);
    setError('');
    host.replaceChildren();
    pdf.getPage(page).then(async (pdfPage) => {
      if (!active) return;
      const original = pdfPage.getViewport({ scale: 1 });
      const viewport = pdfPage.getViewport({ scale: width / original.width });
      const density = Math.min(window.devicePixelRatio || 1, 2, 8192 / viewport.height, Math.sqrt(8_000_000 / (viewport.width * viewport.height)));
      const canvas = host.ownerDocument.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width * density));
      canvas.height = Math.max(1, Math.floor(viewport.height * density));
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `PDF 第 ${page} 页`);
      task = pdfPage.render({ canvas, viewport, transform: [density, 0, 0, density, 0, 0] });
      await task.promise;
      if (active) { host.replaceChildren(canvas); setRendering(false); }
    }).catch(() => { if (active) setError('该页无法预览，请下载原文件后查看。'); });
    return () => { active = false; task?.cancel(); };
  }, [pdf, page, width]);

  return <section className="share-pdf" aria-label="PDF 阅读器">
    {pdf && pdf.numPages > 1 && <div className="share-pdf-controls">
      <button type="button" onClick={() => setPage((n) => n - 1)} disabled={page <= 1}><ArrowLeft size={16} /> 上一页</button>
      <span aria-live="polite">第 {page} / {pdf.numPages} 页</span>
      <button type="button" onClick={() => setPage((n) => n + 1)} disabled={page >= pdf.numPages}>下一页 <ArrowRight size={16} /></button>
    </div>}
    {error ? <p role="alert">{error}</p> : rendering && <p role="status">正在绘制 PDF…</p>}
    <div className="share-pdf-sheet" ref={surface} />
  </section>;
}
