import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, CircleAlert, LayoutGrid, LockKeyhole, NotebookPen, Star } from 'lucide-react';
import iconUrl from '../assets/icon.svg';
import { api, sendJson } from '../data/labApi';
import { deskProjects } from '../data/catalog';
import { defaultHome, homeFields } from '../data/labContent';
import { CatalogDesk, RecordDialog } from './WorkbenchRecords';
import { Bookmarks } from './WorkbenchLinks';
import { NotesDesk } from './WorkbenchNotes';
import { DeskConfirm } from './WorkbenchUi';
import WorkbenchVisitors from './WorkbenchVisitors';
import './Workbench.css';

const sections = [
  { id: 'catalog', name: '后台中心', caption: 'SITE OPERATIONS', detail: '更新站点内容，集中打开各个项目的管理后台。', icon: LayoutGrid },
  { id: 'bookmarks', name: '星标网站', caption: 'LINK LIBRARY', detail: '把工作和生活中常用的网站收进自己的链接库。', icon: Star },
  { id: 'notes', name: '头脑风暴', caption: 'IDEA NOTEBOOK', detail: '把想法写下来、画出来，随时回来接着想。', icon: NotebookPen },
];
const collections = ['projects', 'games', 'skills', 'documents', 'admin-links', 'bookmarks', 'notes'];
const endpoint = (kind) => `/api/workbench/${kind}`;

function Desk({ session, onLock }) {
  const [sectionId, setSectionId] = useState('catalog');
  const [category, setCategory] = useState('home');
  const [home, setHome] = useState(session.home ?? defaultHome);
  const [draft, setDraft] = useState(home);
  const [records, setRecords] = useState({});
  const [loadState, setLoadState] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [editor, setEditor] = useState(null);
  const [notice, setNotice] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [busy, setBusy] = useState(false);
  const section = sections.find(({ id }) => id === sectionId);
  const dirty = homeFields.some(({ key }) => draft[key] !== home[key]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), notice.error ? 5200 : 2800);
    return () => clearTimeout(timer);
  }, [notice]);

  function setMessage(message, error = false) {
    setNotice(message ? { message, error } : null);
  }

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(collections.map(async (kind) => {
      const result = await api(endpoint(kind), { signal: controller.signal });
      return [kind, result.items];
    })).then((entries) => {
      if (controller.signal.aborted) return;
      setRecords(Object.fromEntries(entries));
      setLoadState('ready');
    }).catch((error) => {
      if (controller.signal.aborted) return;
      setLoadState(error.message);
    });
    return () => controller.abort();
  }, [attempt]);

  function openEditor(kind, item = null) {
    setMessage('');
    setEditor({ kind, item });
  }

  async function save(kind, input) {
    const id = input.id || crypto.randomUUID();
    let options = sendJson('PUT', input);
    if (kind === 'documents') {
      const { name, description, published, revision, upload } = input;
      const body = new FormData();
      body.set('metadata', JSON.stringify({ name, description, published, revision }));
      if (upload) body.set('file', upload);
      options = { method: 'PUT', body };
    }
    const { item } = await api(`${endpoint(kind)}/${id}`, options);
    setRecords((all) => ({ ...all, [kind]: [item, ...all[kind].filter((row) => row.id !== item.id)] }));
    setMessage(['projects', 'games', 'skills', 'documents'].includes(kind) ? item.published ? '已发布，访客刷新页面即可看到。' : '已保存为草稿。' : '已保存。');
    return item;
  }

  async function remove(kind, item) {
    setBusy(true);
    setMessage('');
    try {
      await api(`${endpoint(kind)}/${item.id}`, sendJson('DELETE', { revision: item.revision }));
      setRecords((all) => ({ ...all, [kind]: all[kind].filter((row) => row.id !== item.id) }));
      setMessage('已删除。');
    } catch (error) { setMessage(error.message, true); }
    finally { setBusy(false); }
  }

  async function publish(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const data = await api('/api/workbench/home', sendJson('PUT', draft));
      setHome(data.home);
      setDraft(data.home);
      setMessage('首页已发布。');
    } catch (error) { setMessage(error.message, true); }
    finally { setBusy(false); }
  }

  async function lock() {
    setBusy(true);
    setMessage('');
    try { await onLock(); }
    catch (error) { setMessage(error.message, true); }
    finally { setBusy(false); }
  }

  function askRemove(kind, item) {
    setConfirmation({ title: `删除「${item.name}」？`, label: '删除', action: () => remove(kind, item) });
  }

  const projects = deskProjects(records.projects);
  return <main id="main-content" className="desk">
    <aside className="desk-sidebar">
      <a className="desk-brand" href="/" aria-label="返回 LULU LAB"><img className="desk-mark" src={iconUrl} alt="" width="42" height="42" /><span><strong>LULU LAB</strong><small>个人工作台</small></span></a>
      <nav aria-label="工作台导航">
        {sections.map(({ id, name, icon: Icon }) => <button type="button" key={id} aria-current={id === sectionId ? 'page' : undefined} onClick={() => { setSectionId(id); setMessage(''); }}>
          <Icon size={19} /><span>{name}</span>
        </button>)}
      </nav>
      <WorkbenchVisitors />
      <div className="desk-sidebar-end">
        <span className="desk-session"><i /> 私有会话已解锁</span>
        <a href="/" target="_blank" rel="noreferrer">公开站点 <ArrowUpRight size={15} /></a>
        <button type="button" disabled={busy} onClick={() => {
          if (dirty) setConfirmation({ title: '锁定工作台？', detail: '未发布的首页修改将被丢弃。', label: '锁定', action: lock });
          else lock();
        }}><LockKeyhole size={15} /> 锁定工作台</button>
      </div>
    </aside>
    <div className="desk-main">
      <header className="desk-heading">
        <div><p className="desk-eyebrow">{section.caption}</p><h1>{section.name}</h1><p>{section.detail}</p></div>
        <span className="desk-private">OWNER / LULU</span>
      </header>
      {loadState !== 'ready' ? <div className="desk-empty">
        <p role="status">{loadState === 'loading' ? '正在读取工作台数据…' : loadState}</p>
        {loadState !== 'loading' && <button type="button" className="desk-button" onClick={() => { setLoadState('loading'); setAttempt((n) => n + 1); }}>重新读取</button>}
      </div> : <>
        {sectionId === 'catalog' && <CatalogDesk {...{ category, setCategory, projects, records, draft, setDraft, dirty, publish, busy, openEditor, save, setMessage }} remove={askRemove} confirmAction={setConfirmation} resetHome={() => setDraft(home)} frameOrigins={session.frameOrigins ?? []} />}
        {sectionId === 'bookmarks' && <Bookmarks items={records.bookmarks} {...{ openEditor, busy }} remove={askRemove} />}
        {sectionId === 'notes' && <NotesDesk items={records.notes} {...{ openEditor, busy }} remove={askRemove} />}
      </>}
    </div>
    <div className="desk-toast-region" aria-live="polite" aria-atomic="true">
      {notice && <p className="desk-toast" data-error={notice.error}>{notice.error ? <CircleAlert size={17} /> : <Check size={17} />} {notice.message}</p>}
    </div>
    {editor && <RecordDialog {...editor} projects={projects} games={records.games} confirmAction={setConfirmation} onSave={save} onClose={() => setEditor(null)} />}
    {confirmation && <DeskConfirm {...confirmation} onDismiss={() => setConfirmation(null)} />}
  </main>;
}

export default function Workbench() {
  const [session, setSession] = useState(null);
  const [passphrase, setPassphrase] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api('/api/workbench/session', { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setSession(data);
    }).catch(() => {
      if (!controller.signal.aborted) setSession({ offline: true });
    });
    return () => controller.abort();
  }, []);

  async function unlock(event) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    try {
      const data = await api('/api/workbench/session', sendJson('POST', { passphrase }));
      setPassphrase('');
      setSession({ ...data, configured: true });
    } catch (error) { setMessage(error.message); }
    finally { setPending(false); }
  }

  async function lock() {
    await api('/api/workbench/session', { method: 'DELETE' });
    setSession({ configured: true, unlocked: false });
  }

  if (session?.unlocked) return <Desk session={session} onLock={lock} />;
  return <main id="main-content" className="desk-gate">
    <section className="desk-gate-card">
      <img className="desk-mark" src={iconUrl} alt="" width="42" height="42" />
      <p className="desk-eyebrow">LULU LAB / OWNER ACCESS</p>
      <h1>个人工作台</h1>
      <p>网站管理、收藏和想法的私人空间。</p>
      {session?.configured ? <form className="desk-form" onSubmit={unlock}>
        <label>私密口令<input type="password" autoComplete="current-password" required maxLength={256} value={passphrase} onChange={(event) => setPassphrase(event.target.value)} /></label>
        <button className="desk-button" disabled={pending}>{pending ? '正在验证…' : '解锁工作台'}</button>
      </form> : <p role="status">{!session ? '正在检查工作台状态…' : session.offline ? '工作台暂不可用，请确认服务端已启动。' : '请先在服务器配置工作台口令。'}</p>}
      {message && <p className="desk-error" role="alert">{message}</p>}
      <a className="desk-gate-return" href="/">返回公开站点 <ArrowUpRight size={15} /></a>
    </section>
  </main>;
}
