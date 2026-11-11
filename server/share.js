import { open } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { shareLimits } from '../src/data/workbench.js';
import { httpError } from './workbench.js';

export async function parseShareForm(type, body) {
  let form, fields;
  try {
    form = await new Response(body, { headers: { 'Content-Type': type } }).formData();
    fields = JSON.parse(form.get('metadata'));
  } catch {
    throw httpError(400, '资料表单无法读取。');
  }
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) throw httpError(400, '请检查资料信息。');

  const file = form.get('file');
  if (file === null) return { fields };
  if (!(file instanceof File) || !file.size) throw httpError(400, '请选择非空文件。');
  const extension = file.name.match(/\.(pdf|md|markdown)$/i)?.[1].toLowerCase();
  if (!extension) throw httpError(415, '仅支持 PDF 和 Markdown 文件。');
  const format = extension === 'pdf' ? 'pdf' : 'md';
  if (file.size > shareLimits[format]) throw httpError(413, '文件超过大小限制。');
  const bytes = Buffer.from(await file.arrayBuffer());
  if (format === 'pdf') {
    if (!/%PDF-[12]\.\d/.test(bytes.subarray(0, 1024).toString('latin1')) ||
      !bytes.subarray(-2048).includes('%%EOF')) throw httpError(400, '文件不是有效的 PDF。');
  } else {
    try {
      const markdown = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      if (!markdown.trim() || markdown.includes('\0')) throw new Error('Empty or binary Markdown');
    } catch {
      throw httpError(400, '请选择非空的 UTF-8 Markdown 文档。');
    }
  }

  const base = file.name.replace(/\.[^.]*$/, '').replace(/[/\\\p{Cc}]/gu, '_').trim();
  const name = ([...base].slice(0, 120).join('') || 'document') + '.' + extension;
  return { fields, upload: { bytes, info: { name, size: bytes.length, type: format } } };
}

export async function sendSharedFile(req, res, file, path) {
  let handle;
  try { handle = await open(path, 'r'); }
  catch (error) {
    if (error.code === 'ENOENT') throw httpError(404, '文件已更新或删除，请刷新后再试。');
    throw error;
  }
  const filename = encodeURIComponent(file.name).replace(/[!'()*]/g, (char) => '%' + char.charCodeAt(0).toString(16));
  res.writeHead(200, {
    'Content-Type': file.type === 'pdf' ? 'application/pdf' : 'text/markdown; charset=utf-8',
    'Content-Length': file.size,
    'Content-Disposition': "attachment; filename*=UTF-8''" + filename,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  if (req.method === 'HEAD') {
    await handle.close();
    res.end();
    return;
  }
  await pipeline(handle.createReadStream(), res);
}
