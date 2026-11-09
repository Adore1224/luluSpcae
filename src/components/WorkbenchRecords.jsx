import { useRef, useState } from 'react';
import { Boxes, Gamepad2, Globe2, Monitor, Plus, X } from 'lucide-react';
import { homeFields } from '../data/labContent';
import { matchSearch, noteTextBlocks } from '../data/workbench';
import { NoteFields } from './WorkbenchNotes';
import { DeskDialog, DeskEmpty, ExternalLink, Search } from './WorkbenchUi';

const types = {
  projects: '项目', games: '游戏', 'admin-links': '后台入口', bookmarks: '星标网站', notes: '笔记',
};

function HomeEditor({ draft, setDraft, dirty, publish, busy, resetHome }) {
  return <div className="desk-home-layout">
    <form className="desk-panel desk-form" onSubmit={publish}>
      <h2>首页文案</h2>
      {homeFields.map(({ key, label, max }) => <label key={key}>{label}<small>{draft[key].length}/{max}</small>
        {key === 'description'
          ? <textarea rows="3" required maxLength={max} disabled={busy} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
          : <input required maxLength={max} disabled={busy} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />}
      </label>)}
      <div className="desk-actions"><button className="desk-button" disabled={!dirty || busy}>发布到首页</button><button type="button" className="desk-quiet" disabled={!dirty || busy} onClick={resetHome}>撤销未发布修改</button></div>
    </form>
    <aside className="desk-home-preview desk-panel">
      <div className="desk-row"><span className="desk-eyebrow">PREVIEW</span><span className="desk-pill">{dirty ? '未发布修改' : '已发布'}</span></div>
      <div className="desk-preview-copy"><small>{draft.eyebrow}</small><strong>LULU LAB<span>.</span></strong><h2>{draft.headline}</h2><p>{draft.description}</p></div>
      <div className="desk-row"><span>{draft.status}</span><ExternalLink href="/">查看公开首页</ExternalLink></div>
    </aside>
  </div>;
}

const catalogTabs = [['home', '首页文案'], ['projects', '项目'], ['games', '游戏'], ['admin-links', '外部后台']];

export function CatalogDesk({ category, setCategory, projects, records, openEditor, remove, save, busy, setMessage, frameOrigins, confirmAction, ...home }) {
  const [query, setQuery] = useState('');
  const [frame, setFrame] = useState(null);
  const items = category === 'projects' ? projects : records[category] ?? [];
  const filtered = items.filter((item) => matchSearch(query, item.name, item.id, item.description, item.overview, item.href));

  async function unpublish(item) {
    try { await save('projects', { ...item, technologies: item.technologies?.join('，'), published: false }); }
    catch (error) { setMessage(error.message, true); }
  }

  function removeRecord(item) {
    if (item.sourceBacked) confirmAction({ title: `从公开项目页下架「${item.name}」？`, label: '下架', action: () => unpublish(item) });
    else remove(category, item);
  }

  return <>
    <nav className="desk-tabs" aria-label="后台中心分类">
      {catalogTabs.map(([id, title]) => <button type="button" key={id} aria-current={category === id ? 'page' : undefined}
        onClick={() => { setCategory(id); setQuery(''); setFrame(null); setMessage(''); }}>{title}</button>)}
    </nav>
    {category === 'home' ? <HomeEditor {...home} busy={busy} /> : <>
      <div className="desk-tools"><Search label={`搜索${types[category]}`} value={query} onChange={setQuery} />
        <button type="button" className="desk-button" onClick={() => openEditor(category)}><Plus size={16} /> 新建{types[category]}</button></div>
      {frame && category === 'admin-links' && <section className="desk-panel desk-frame">
        <div className="desk-row"><h2>{frame.name}</h2><div className="desk-actions"><ExternalLink href={frame.href}>新标签页打开</ExternalLink><button type="button" className="desk-quiet" onClick={() => setFrame(null)}>关闭预览</button></div></div>
        <p>若页面空白、提示禁止嵌入或登录受限，可用新标签页打开。</p>
        <iframe title={frame.name} src={frame.href} sandbox="allow-forms allow-scripts allow-same-origin" referrerPolicy="no-referrer" />
      </section>}
      {filtered.length ? <ul className="desk-list">{filtered.map((item) => {
        const admin = category === 'admin-links';
        const origin = admin ? new URL(item.href).origin : '';
        const embeddable = admin && origin !== location.origin && frameOrigins.includes(origin);
        const Icon = admin ? Globe2 : category === 'projects' ? Boxes : Gamepad2;
        return <li className="desk-panel desk-record" key={item.id ?? item.name}>
          <span className="desk-record-icon"><Icon size={18} /></span>
          <div className="desk-record-copy"><h2>{item.name}</h2><p>{admin ? projects.find(({ id }) => id === item.projectId)?.name || item.description || origin : item.technologies?.slice(0, 3).join(' · ') || item.description}</p></div>
          {!admin && <span className="desk-pill" data-live={item.published}>{item.published ? '已发布' : '草稿'}</span>}
          <div className="desk-actions">
            {admin && <ExternalLink href={item.href}>打开后台</ExternalLink>}
            {embeddable && <button type="button" className="desk-quiet" onClick={() => setFrame(item)}><Monitor size={15} /> 页内预览</button>}
            <button type="button" className="desk-quiet" onClick={() => openEditor(category, item)}>编辑</button>
            {(!item.sourceBacked || item.published) && <button type="button" className="desk-quiet desk-danger" disabled={busy} onClick={() => removeRecord(item)}>{item.sourceBacked ? '下架' : '删除'}</button>}
          </div>
        </li>;
      })}</ul> : <DeskEmpty icon={Boxes}>{query ? '没有匹配的条目。' : category === 'admin-links' ? '添加一个后台入口，在这里集中打开。' : '还没有记录，可以新建一条草稿。'}</DeskEmpty>}
    </>}
  </>;
}

function GalleryFields({ draft, change, originalCount }) {
  const gallery = draft.gallery;
  return <fieldset className="desk-gallery-editor">
    <legend>项目截图</legend>
    {originalCount > 0 && <label className="desk-check"><input type="checkbox" checked={gallery === null} onChange={(event) => change('gallery', event.target.checked ? null : [])} />使用原有的 {originalCount} 张截图</label>}
    {gallery !== null && <>
      {gallery.map((shot, index) => <div className="desk-gallery-fields" key={index}>
        <label>截图 {index + 1} URL<input type="url" required maxLength={1500} placeholder="https://…" value={shot.image} onChange={(event) => change('gallery', gallery.map((row, i) => i === index ? { ...row, image: event.target.value } : row))} /></label>
        <label>截图说明<input maxLength={240} value={shot.description} onChange={(event) => change('gallery', gallery.map((row, i) => i === index ? { ...row, description: event.target.value } : row))} /></label>
        <button type="button" className="desk-quiet" onClick={() => change('gallery', gallery.filter((_, i) => i !== index))} aria-label={`移除截图 ${index + 1}`}><X size={16} /></button>
      </div>)}
      {gallery.length < 12 && <button type="button" className="desk-quiet" onClick={() => change('gallery', [...gallery, { image: '', description: '' }])}><Plus size={15} /> 添加 HTTPS 截图地址</button>}
    </>}
  </fieldset>;
}

export function RecordDialog({ kind, item, projects, games, confirmAction, onSave, onClose }) {
  const catalog = kind === 'projects' || kind === 'games';
  const [draft, setDraft] = useState(() => ({
    id: '', name: '', href: '', overview: '', description: '', category: '', projectId: '', published: false, pinned: false, body: '', drawing: [],
    ...item, technologies: item?.technologies?.join('，') ?? '', gallery: item?.gallery ?? [],
    ...(item?.sourceBacked && item.gallery === null ? { gallery: null } : {}),
    ...(kind === 'notes' ? { body: '', textBlocks: noteTextBlocks(item) } : {}),
  }));
  const initial = useRef(JSON.stringify(draft));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const change = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  function dismiss() {
    if (pending) return;
    if (JSON.stringify(draft) === initial.current) onClose();
    else confirmAction({ title: '丢弃未保存的修改？', label: '丢弃修改', action: onClose });
  }

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    if (!item && catalog && (kind === 'projects' ? projects : games).some(({ id }) => id === draft.id)) {
      setError('此标识已存在，请编辑原记录或换一个标识。');
      return;
    }
    setError('');
    setPending(true);
    try {
      await onSave(kind, draft);
      onClose();
    } catch (failure) { setError(failure.message); }
    finally { setPending(false); }
  }

  const input = (key, label, options = {}) => <label>{label}<input {...options} value={draft[key]} onChange={(event) => change(key, event.target.value)} /></label>;
  const area = (key, label, required, maxLength) => <label>{label}<textarea rows="4" required={required} maxLength={maxLength} value={draft[key]} onChange={(event) => change(key, event.target.value)} /></label>;
  return <DeskDialog title={`${item ? '编辑' : '新建'}${types[kind]}`} eyebrow="WORKSPACE EDITOR" className={kind === 'notes' ? 'desk-dialog-note' : ''} onDismiss={dismiss} busy={pending}>
    <form className="desk-form" onSubmit={submit}>
      <fieldset disabled={pending}>
        {input('name', kind === 'notes' ? '笔记标题' : '名称', { required: true, maxLength: 100 })}
        {catalog && !item && input('id', '标识（小写英文、数字或短横线）', { required: true, pattern: '[a-z0-9][a-z0-9\\-]{0,63}', maxLength: 64, placeholder: 'my-project' })}
        {kind === 'projects' && <>
          {area('overview', '项目介绍', true, 1800)}
          {input('technologies', '技术栈（逗号分隔）', { maxLength: 320 })}
          {!item?.hideGallery && <GalleryFields {...{ draft, change }} originalCount={item?.originalCount} />}
        </>}
        {kind === 'games' && area('description', '游戏介绍', true, 1800)}
        {kind !== 'notes' && input('href', kind === 'games' ? '试玩地址' : kind === 'admin-links' ? '后台地址' : '访问地址', { type: 'url', maxLength: 1500, required: !catalog, placeholder: 'https://…' })}
        {catalog && <label className="desk-check"><input type="checkbox" checked={draft.published} onChange={(event) => change('published', event.target.checked)} />在公开网站展示</label>}
        {(kind === 'admin-links' || kind === 'bookmarks') && area('description', '简短说明', false, 300)}
        {kind === 'admin-links' && <label>关联项目<select value={draft.projectId} onChange={(event) => change('projectId', event.target.value)}><option value="">独立入口</option>{projects.map(({ id, name: title }) => <option key={id} value={id}>{title}</option>)}</select></label>}
        {kind === 'bookmarks' && <>
          {input('category', '分组', { maxLength: 40, placeholder: '工作、生活、学习…' })}
          <label className="desk-check"><input type="checkbox" checked={draft.pinned} onChange={(event) => change('pinned', event.target.checked)} />置顶显示</label>
        </>}
        {kind === 'notes' && <NoteFields {...{ draft, change, confirmAction }} />}
      </fieldset>
      {error && <p className="desk-error" role="alert">{error}</p>}
      <div className="desk-actions"><button className="desk-button" disabled={pending}>{pending ? '正在保存…' : catalog && draft.published ? '保存并发布' : '保存'}</button><button type="button" className="desk-quiet" disabled={pending} onClick={dismiss}>取消</button></div>
    </form>
  </DeskDialog>;
}
