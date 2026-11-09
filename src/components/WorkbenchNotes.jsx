import { useRef, useState } from 'react';
import { Hand, Minus, NotebookPen, PenLine, Plus, Type, Undo2 } from 'lucide-react';
import { matchSearch, notePaper, noteTextBlocks } from '../data/workbench';
import { DeskEmpty, Search } from './WorkbenchUi';

function inline(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function NotePreview({ body }) {
  if (!body.trim()) return <p>这里会显示笔记排版。</p>;
  const blocks = body.trim().split(/(^```[^\n]*\n[\s\S]*?^```[ \t]*(?=\n|$))/m)
    .flatMap((part, index) => index % 2 ? [part.trimEnd()] : part.trim().split(/\n{2,}/).filter(Boolean));
  return <div className="desk-note-preview">{blocks.map((block, index) => {
    if (block.startsWith('```') && block.endsWith('```')) return <pre key={index}>{block.replace(/^```[^\n]*\n|\n?```$/g, '')}</pre>;
    if (/^#{1,3} /.test(block)) {
      const [heading, ...bodyLines] = block.split('\n');
      return <div key={index}><h3>{inline(heading.replace(/^#{1,3} /, ''))}</h3>{bodyLines.length > 0 && <p>{inline(bodyLines.join('\n'))}</p>}</div>;
    }
    const lines = block.split('\n');
    if (lines.every((line) => /^[-*] /.test(line))) return <ul key={index}>{lines.map((line, i) => <li key={i}>{inline(line.slice(2))}</li>)}</ul>;
    return <p key={index}>{inline(block)}</p>;
  })}</div>;
}

function Stroke({ stroke }) {
  const { points, color, width } = stroke;
  if (points.length === 2) return <circle cx={points[0]} cy={points[1]} r={width / 2} fill={color} />;
  return <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />;
}

const colors = [['#263a2d', '墨绿'], ['#b05d49', '砖红'], ['#35689c', '蓝色']];
const { width: paperWidth, height: paperHeight, maxTextX, maxTextY, maxBlocks, maxText } = notePaper;
const viewBox = `0 0 ${paperWidth} ${paperHeight}`;

export function NoteFields({ draft, change, confirmAction }) {
  const { drawing, textBlocks } = draft;
  const [tool, setTool] = useState('pen');
  const [zoom, setZoom] = useState(100);
  const [color, setColor] = useState(colors[0][0]);
  const [width, setWidth] = useState(4);
  const [live, setLive] = useState(null);
  const [editing, setEditing] = useState(null);
  const pen = useRef(null);
  const viewport = useRef(null);
  const paper = useRef(null);
  const textLength = textBlocks.reduce((length, block) => length + block.text.length, 0);

  const point = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return [
      Math.round(Math.max(0, Math.min(paperWidth, (event.clientX - rect.left) * paperWidth / rect.width))),
      Math.round(Math.max(0, Math.min(paperHeight, (event.clientY - rect.top) * paperHeight / rect.height))),
    ];
  };
  function start(event) {
    if (tool !== 'pen' || event.button !== 0 || pen.current || drawing.length >= 60) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke = { points: point(event), color, width };
    pen.current = { pointer: event.pointerId, stroke };
    setLive(stroke);
  }
  function move(event) {
    const current = pen.current;
    if (current?.pointer !== event.pointerId) return;
    const points = current.stroke.points;
    const [x, y] = point(event);
    if (Math.hypot(x - points.at(-2), y - points.at(-1)) < 2) return;
    const retained = points.length >= 320 ? points.filter((_, index) => index % 4 < 2) : points;
    current.stroke = { ...current.stroke, points: [...retained, x, y] };
    setLive(current.stroke);
  }
  function stop(event, commit) {
    if (pen.current?.pointer !== event.pointerId) return;
    if (commit) change('drawing', [...drawing, pen.current.stroke]);
    pen.current = null;
    setLive(null);
  }

  function addText(event) {
    if (tool !== 'text' || textBlocks.length >= maxBlocks || textLength >= maxText) return;
    const [x, y] = event ? point(event) : [24, 24];
    change('textBlocks', [...textBlocks, { x: Math.min(x, maxTextX), y: Math.min(y, maxTextY), text: '' }]);
    setEditing(textBlocks.length);
  }

  function selectTool(next) {
    setTool(next);
    setEditing(null);
  }

  function resize(next) {
    const container = viewport.current;
    const board = paper.current;
    const x = (container.scrollLeft + Math.min(container.clientWidth, board.offsetWidth) / 2) / board.offsetWidth;
    const y = (container.scrollTop + Math.min(container.clientHeight, board.offsetHeight) / 2) / board.offsetHeight;
    setZoom(next);
    requestAnimationFrame(() => container.scrollTo(
      x * board.offsetWidth - container.clientWidth / 2,
      y * board.offsetHeight - container.clientHeight / 2,
    ));
  }

  return <div className="desk-note-editor">
    <div className="desk-canvas-tools">
      <div className="desk-actions" role="group" aria-label="画布工具">
        <button type="button" className="desk-quiet" aria-pressed={tool === 'pen'} onClick={() => selectTool('pen')}><PenLine size={16} /> 画笔</button>
        <button type="button" className="desk-quiet" aria-pressed={tool === 'text'} onClick={() => selectTool('text')}><Type size={16} /> 文字</button>
        <button type="button" className="desk-quiet" aria-pressed={tool === 'browse'} onClick={() => selectTool('browse')}><Hand size={16} /> 浏览</button>
      </div>
      {tool === 'pen' && <div className="desk-actions" role="group" aria-label="画笔设置">
        {colors.map(([value, label]) => <button type="button" className="desk-swatch" key={value} style={{ '--swatch': value }} aria-label={label} aria-pressed={color === value} onClick={() => setColor(value)} />)}
        <select aria-label="笔画粗细" value={width} onChange={(event) => setWidth(Number(event.target.value))}><option value="2">细</option><option value="4">中</option><option value="7">粗</option></select>
        <button type="button" className="desk-quiet" disabled={!drawing.length} onClick={() => change('drawing', drawing.slice(0, -1))}><Undo2 size={15} /> 撤销笔画</button>
        <button type="button" className="desk-quiet" disabled={!drawing.length} onClick={() => confirmAction({
          title: '清空所有笔画？', detail: '画布上的文字会保留。', label: '清空笔画', action: () => change('drawing', []),
        })}>清空笔画</button>
      </div>}
      {tool === 'text' && <div className="desk-actions">
        <button type="button" className="desk-quiet" disabled={textBlocks.length >= maxBlocks || textLength >= maxText} onClick={() => addText()}><Plus size={15} /> 添加文字</button>
        {editing !== null && <button type="button" className="desk-quiet desk-danger" onClick={() => {
          const removeText = () => {
            change('textBlocks', textBlocks.filter((_, i) => i !== editing));
            setEditing(null);
          };
          if (textBlocks[editing].text.trim()) confirmAction({ title: '移除这段文字？', label: '移除', action: removeText });
          else removeText();
        }}>移除文字</button>}
      </div>}
      <div className="desk-actions desk-zoom" role="group" aria-label="画布缩放">
        <button type="button" className="desk-quiet" aria-label="缩小画布" disabled={zoom <= 50} onClick={() => resize(zoom - 25)}><Minus size={16} /></button>
        <button type="button" className="desk-quiet" aria-label={`重置画布缩放，当前 ${zoom}%`} onClick={() => resize(100)}>{zoom}%</button>
        <button type="button" className="desk-quiet" aria-label="放大画布" disabled={zoom >= 200} onClick={() => resize(zoom + 25)}><Plus size={16} /></button>
      </div>
    </div>
    <div className="desk-canvas-view" ref={viewport} role="region" aria-label="笔记画布" tabIndex={0} style={{ '--desk-zoom': zoom / 100 }}>
      <div className="desk-paper" ref={paper} data-tool={tool}>
        <svg className="desk-canvas" viewBox={viewBox} preserveAspectRatio="none" role="img" aria-label="手绘与文字画布"
          onClick={addText} onPointerDown={start} onPointerMove={move} onPointerUp={(event) => stop(event, true)}
          onPointerCancel={(event) => stop(event, false)} onLostPointerCapture={(event) => stop(event, false)}>
          {drawing.map((stroke, index) => <Stroke key={index} stroke={stroke} />)}{live && <Stroke stroke={live} />}
        </svg>
        {textBlocks.map((block, index) => <div key={index} className="desk-paper-text" data-editing={editing === index}
          style={{ '--text-x': `${block.x / paperWidth * 100}%`, '--text-y': `${block.y / paperHeight * 100}%`, '--text-space': (paperHeight - block.y) / paperWidth }}>
          {editing === index ? <textarea autoFocus rows="4" aria-label={`画布文字 ${index + 1}`} placeholder="在这里输入文字…" value={block.text}
            maxLength={maxText - textLength + block.text.length}
            onChange={(event) => change('textBlocks', textBlocks.map((current, i) => i === index ? { ...current, text: event.target.value } : current))} />
            : <div className="desk-paper-preview" role={tool === 'text' ? 'button' : undefined} tabIndex={tool === 'text' ? 0 : undefined}
              aria-label={tool === 'text' ? `编辑画布文字 ${index + 1}：${block.text.slice(0, 60)}` : undefined}
              onClick={() => { if (tool === 'text') setEditing(index); }} onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setEditing(index); }
              }}><NotePreview body={block.text} /></div>}
        </div>)}
      </div>
    </div>
    <small>{tool === 'text' ? '点画布放置文字，点已有文字继续编辑。支持 Markdown。' : tool === 'browse' ? '滚动或滑动画布，查看放大后的其他区域。' : `用鼠标或手指在画布上画图 · ${drawing.length}/60 笔`}</small>
  </div>;
}

export function NotesDesk({ items, openEditor, remove, busy }) {
  const [query, setQuery] = useState('');
  const filtered = items.map((item) => ({ item, summary: noteTextBlocks(item).map(({ text }) => text).join('\n') }))
    .filter(({ item, summary }) => matchSearch(query, item.name, summary));
  return <>
    <div className="desk-tools"><Search label="搜索笔记" value={query} onChange={setQuery} /><button type="button" className="desk-button" onClick={() => openEditor('notes')}><Plus size={16} /> 新建笔记</button></div>
    {filtered.length ? <div className="desk-card-grid">{filtered.map(({ item, summary }) => <article className="desk-panel desk-note-card" key={item.id}>
      <button type="button" className="desk-card-open" onClick={() => openEditor('notes', item)}>
        <small><NotebookPen size={15} /> {new Date(item.updatedAt).toLocaleDateString('zh-CN')}</small><h2>{item.name}</h2><p>{summary || '草图笔记'}</p>
        {item.drawing.length > 0 && <svg className="desk-note-thumb" viewBox={viewBox} aria-hidden="true">{item.drawing.map((stroke, i) => <Stroke key={i} stroke={stroke} />)}</svg>}
      </button>
      <div className="desk-actions"><button type="button" className="desk-quiet" onClick={() => openEditor('notes', item)}>打开笔记</button><button type="button" className="desk-quiet desk-danger" disabled={busy} onClick={() => remove('notes', item)}>删除</button></div>
    </article>)}</div> : <DeskEmpty icon={NotebookPen}>{query ? '没有匹配的笔记。' : '写下第一个想法，也可以直接画一张草图。'}</DeskEmpty>}
  </>;
}
