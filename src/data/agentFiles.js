import { agentReferenceLimits } from './workbench';

const extensions = /\.(?:txt|md|markdown|csv|tsv|json|log|pdf)$/i;
export const referenceAccept = '.pdf,.txt,.md,.markdown,.csv,.tsv,.json,.log';

async function extractPdf(file, limit) {
  const { getDocument, GlobalWorkerOptions, version } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { default: workerUrl } = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
  GlobalWorkerOptions.workerSrc = workerUrl;
  const assets = `/assets/pdfjs-${version}/`;
  const task = getDocument({
    data: new Uint8Array(await file.arrayBuffer()), useWasm: false, enableXfa: false,
    cMapUrl: assets + 'cmaps/', standardFontDataUrl: assets + 'standard_fonts/',
  });
  try {
    const pdf = await task.promise;
    const highestPage = Math.min(pdf.numPages, agentReferenceLimits.pdfPages);
    const sections = [];
    let length = 0;
    for (let page = 1; page <= highestPage; page += 1) {
      const pdfPage = await pdf.getPage(page);
      const { items } = await pdfPage.getTextContent();
      const text = items.map((item) => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('').trim();
      pdfPage.cleanup();
      if (!text) continue;
      const section = `[第 ${page} 页]\n${text}`;
      sections.push(section);
      length += section.length + 2;
      if (length > limit) return { text: sections.join('\n\n'), partial: true };
    }
    return { text: sections.join('\n\n'), partial: highestPage < pdf.numPages };
  } catch (error) {
    throw new Error(error.name === 'PasswordException' ? '请先解锁这份 PDF。' : '无法读取这份 PDF。');
  } finally { await task.destroy().catch(() => {}); }
}

export async function readAgentFile(file, available) {
  const name = file.name.slice(0, 180);
  if (!extensions.test(file.name)) throw new Error('支持 PDF、TXT、Markdown、CSV、TSV、JSON 或日志文件。');
  if (file.size > agentReferenceLimits.bytes) throw new Error('单个文件最多 10 MiB。');
  const limit = Math.min(available, agentReferenceLimits.chars);
  if (limit <= 0) throw new Error('参考文字已达上限。');
  const { text, partial } = /\.pdf$/i.test(file.name)
    ? await extractPdf(file, limit)
    : { text: await file.text(), partial: false };
  const clean = text.replace(/\r\n?/g, '\n').replace(/\p{Cc}/gu, (char) => char === '\n' || char === '\t' ? char : '').trim();
  if (!clean || (!/\.pdf$/i.test(file.name) && clean.includes('\ufffd'))) throw new Error('没有可读取的文字。扫描件需要先做 OCR，文本文件请使用 UTF-8。');
  return { name, text: clean.slice(0, limit), truncated: partial || clean.length > limit };
}
