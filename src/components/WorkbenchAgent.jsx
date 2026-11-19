import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Bookmark, BookmarkPlus, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Download, FileText, KeyRound, MessageCircle, Paperclip, Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { homeFields } from '../data/labContent';
import { api, sendJson } from '../data/labApi';
import { agentReferenceLimits } from '../data/workbench';
import { readAgentFile, referenceAccept } from '../data/agentFiles';
import { DeskConfirm, DeskDialog } from './WorkbenchUi';
import './WorkbenchAgent.css';

const root = '/api/workbench/agent';
const pagedKinds = ['chats', 'memories', 'actions'];
const tabs = [['chat', '对话', MessageCircle], ['memories', '记忆', Bookmark], ['models', '模型', KeyRound], ['actions', '操作记录', Clock3]];
const date = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'short', timeStyle: 'short' });
const suggestions = ['一起梳理我今天的优先事项', '把讨论结论整理成一篇笔记', '帮我添加一个日历待办'];
const labels = { home: '修改公开首页', bookmarks: '添加星标网站', notes: '保存灵感笔记', agenda: '添加日历待办' };
const actionStatus = { pending: '待确认', confirmed: '已执行', dismissed: '已取消' };
const actionFields = {
  home: [['value', '新文案', 'text', true, 86]],
  bookmarks: [['name', '网站名称', 'text', true, 100], ['href', '网址', 'url', true, 1500], ['category', '分组', 'text', false, 40], ['description', '说明', 'textarea', false, 300]],
  notes: [['name', '笔记标题', 'text', true, 100], ['body', '笔记正文', 'textarea', true, 15000]],
  agenda: [['name', '待办名称', 'text', true, 100], ['date', '日期', 'date', true], ['time', '时间（选填）', 'time', false]],
};
const modelFields = [['name', '显示名称', 'text', true, 60], ['endpoint', 'API 地址', 'url', true, 500], ['model', '模型 ID', 'text', true, 200], ['apiKey', 'API 密钥', 'password', false, 1024]];
const memoryFields = [['title', '记忆标题', 'text', true, 100], ['body', '记忆内容', 'textarea', true, 4000], ['tag', '项目标签（留空适用于所有对话）', 'text', false, 40]];
const titleFields = [['title', '对话标题', 'text', true, 100]];
const markdownComponents = {
  img: () => null,
  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" />,
};
const get = (path, options) => api(root + '/' + path, options);
const write = (path, method, data = {}) => get(path, sendJson(method, data));

function Editor({ editor, busy, error, close, save }) {
  const { type, item } = editor;
  const isModel = type === 'models';
  const isRename = type === 'rename';
  const isAction = type === 'action';
  const isHome = isAction && item.kind === 'home';
  const homeField = isHome && homeFields.find(({ key }) => key === item.values.field);
  const [draft, change] = useState(isAction ? item.values : { toolCalls: true, ...item });
  const fields = isAction ? actionFields[item.kind] : isRename ? titleFields : isModel ? modelFields : memoryFields;
  const title = isAction ? labels[item.kind] : isRename ? '重命名对话' : (item?.id ? '编辑' : '新增') + (isModel ? '模型' : '记忆');
  const dismiss = () => { if (!busy) close(); };

  return <DeskDialog className="agent-editor" title={title}
    onDismiss={dismiss} busy={busy}>
    {isHome && <dl className="agent-home-preview"><div><dt>首页字段</dt><dd>{homeField.label}</dd></div><div><dt>当前文案</dt><dd>{item.values.before}</dd></div></dl>}
    {isModel && <p className="agent-hint">填写 OpenAI Chat Completions 的公网 HTTPS 地址和供应商模型 ID，例如 kimi-k3.1-pro。密钥加密存放在本站服务端。{item?.id && '保留原地址时，密钥留空可沿用。'}</p>}
    <form className="desk-form agent-form" onSubmit={(event) => { event.preventDefault(); save(draft); }}>
      {fields.map(([key, label, fieldType, required, max]) => {
        const props = {
          value: draft[key] ?? '', disabled: busy, required: required || (key === 'apiKey' && !item?.id),
          maxLength: isHome ? homeField.max : max, onChange: (event) => change({ ...draft, [key]: event.target.value }),
        };
        return <label key={key}>{label}{fieldType === 'textarea'
          ? <textarea {...props} rows={key === 'body' ? 8 : 3} />
          : <input {...props} type={fieldType} autoComplete={fieldType === 'password' ? 'new-password' : undefined}
            placeholder={key === 'endpoint' ? 'https://api.example.com/v1' : undefined} />}</label>;
      })}
      {isModel && <label className="desk-check"><input type="checkbox" checked={draft.toolCalls} disabled={busy} onChange={(event) => change({ ...draft, toolCalls: event.target.checked })} /> 启用工具调用（支持站内操作）</label>}
      {error && <p className="desk-error" role="alert">{error}</p>}
      <div className="desk-actions">
        <button className="desk-button" disabled={busy}>{busy ? '正在处理…' : isHome ? '确认发布' : isAction ? '确认执行' : '保存'}</button>
        <button className="desk-quiet" type="button" disabled={busy} onClick={dismiss}>取消</button>
      </div>
    </form>
  </DeskDialog>;
}

function ActionCard({ item, busy, edit, dismiss, remove, readOnly = false }) {
  const { values, kind, status } = item;
  return <div className="agent-action-card">
    <div><strong>{labels[kind]}</strong><div className="agent-action-meta">
      <span data-status={status}>{actionStatus[status]}</span>
      {remove && <button type="button" className="desk-quiet desk-danger" disabled={busy}
        aria-label={'删除操作记录：' + (values.name || labels[kind])} title="删除操作记录" onClick={() => remove(item)}>
        <Trash2 size={16} aria-hidden="true" />
      </button>}
    </div></div>
    {kind === 'home'
      ? <p>{homeFields.find(({ key }) => key === values.field)?.label}<br />{values.before} → {values.value}</p>
      : <p>{values.name}{kind === 'agenda' && <><br />{values.date} {values.time || '全天'}</>}
        {kind === 'bookmarks' && <><br />{values.href}</>}</p>}
    {status === 'pending' && !readOnly && <div className="desk-actions">
      <button type="button" className="desk-button" disabled={busy} onClick={() => edit(item)}>预览与确认</button>
      <button type="button" className="desk-quiet" disabled={busy} onClick={() => dismiss(item)}>取消操作</button>
    </div>}
  </div>;
}

function PageControls({ page, busy, navigate, label }) {
  if (!page || (page.trail.length <= 1 && !page.next)) return null;
  return <nav className="agent-pages" aria-label={label}>
    <button type="button" className="desk-quiet" aria-label="上一页" disabled={busy || page.trail.length <= 1} onClick={() => navigate('previous')}><ChevronLeft size={16} aria-hidden="true" /></button>
    <span aria-live="polite">第 {page.trail.length} 页</span>
    <button type="button" className="desk-quiet" aria-label="下一页" disabled={busy || !page.next} onClick={() => navigate('next')}><ChevronRight size={16} aria-hidden="true" /></button>
  </nav>;
}

function ResourceList({ view, items, busy, edit, remove, test, read, page, navigate }) {
  const models = view === 'models';
  return <section className="desk-panel agent-resources" aria-label={models ? '模型列表' : '长期记忆'}>
    <div className="agent-section-head">
      <div><h2>{models ? '模型列表' : '长期记忆'}</h2>
        <p>{models ? '模型由你配置，可在同一对话里切换。' : '保存希望在不同对话里复用的偏好、决定和项目背景。'}</p></div>
      <button className="desk-button" type="button" disabled={busy} onClick={() => edit(null)}><Plus size={16} />{models ? '添加模型' : '添加记忆'}</button>
    </div>
    {!items.length && <p className="agent-empty">{models ? '添加一个模型，就可以开始对话。' : '还没有长期记忆。你也可以从任意聊天消息保存。'}</p>}
    {items.map((item) => <article className="agent-resource" key={item.id}>
      <div><h3>{models ? item.name : item.title}</h3>
        {models ? <><p>{item.model} · {item.toolCalls ? '聊天与站内操作' : '仅聊天'}</p><p className="agent-endpoint">{item.endpoint}</p></>
          : <><p className="agent-memory-text">{item.body}</p><small>{item.messageCount ? '对话快照 · ' + item.messageCount + ' 条消息' : item.tag || '通用记忆'}</small></>}</div>
      <div className="desk-actions">
        {models && <button className="desk-quiet" type="button" disabled={busy} onClick={() => test(item)}>测试连接</button>}
        {!models && item.messageCount > 0 && <button className="desk-quiet" type="button" disabled={busy} onClick={() => read(item)}>查看全文</button>}
        <button className="desk-quiet" type="button" disabled={busy} onClick={() => edit(item)}>编辑</button>
        <button className="desk-quiet desk-danger" type="button" disabled={busy} onClick={() => remove(item)}>删除</button>
      </div>
    </article>)}
    {!models && <PageControls {...{ page, busy, navigate }} label="记忆分页" />}
  </section>;
}

function ReferenceTags({ files, remove }) {
  if (!files?.length) return null;
  return <ul className="agent-files" aria-label="参考文件">
    {files.map((file, i) => <li key={i}>
      <FileText size={15} aria-hidden="true" />
      <span title={file.name}>{file.name}</span>
      {file.truncated && <small>节选</small>}
      {remove && <button type="button" aria-label={'移除 ' + file.name} onClick={() => remove(i)}><X size={13} aria-hidden="true" /></button>}
    </li>)}
  </ul>;
}

function ChatMessage({ message, proposals = [], busy, remember, edit, dismiss, children }) {
  const user = message.role === 'user';
  return <article className="agent-message" data-role={message.role}>
    <header>
      {!user && <span className="agent-avatar" aria-hidden="true"><Sparkles size={15} /></span>}
      <strong>{user ? '我' : '小Lu'}</strong>
      {!user && message.modelName && <small title={message.modelName}>{message.modelName}</small>}
      {remember && message.content && <button className="desk-quiet agent-remember" type="button" disabled={busy} onClick={() => remember(message)}
        aria-label={'记住这条：' + message.content.slice(0, 24)} title="记住这条"><Bookmark size={15} aria-hidden="true" /></button>}
    </header>
    {user ? (message.content && <p>{message.content}</p>)
      : <div className="agent-markdown"><Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{message.content}</Markdown></div>}
    <ReferenceTags files={message.references} />
    {proposals.length > 1 && <p className="agent-batch-count">本轮 {proposals.length} 项操作</p>}
    {proposals.map((item) => <ActionCard key={item.id} {...{ item, busy, edit, dismiss }} readOnly={!edit} />)}
    {children}
  </article>;
}

function ChatPanel({ state, selections, handlers }) {
  const { chats, chat, models, messages, proposals, before, busy, thinking, pending, sendFailure, reading, chatPage } = state;
  const { modelId, input, setInput, setModelId, files } = selections;
  const { start, open, older, send, edit, dismiss, remember, remove, toModels, exportChat, attach, removeFile, retry, restore, rename, rememberChat, pageChats } = handlers;
  const area = useRef(null);
  const filePicker = useRef(null);
  const composer = useRef(null);
  const latestMessage = messages.at(-1)?.seq;
  const pendingId = pending?.requestId;

  useEffect(() => {
    if (area.current) area.current.scrollTop = area.current.scrollHeight;
  }, [chat?.id, latestMessage, thinking, pendingId]);

  function sendCurrent(event) {
    event?.preventDefault();
    send();
  }

  return <div className="agent-layout">
    <aside className="desk-panel agent-threads" aria-label="对话列表">
      <div className="agent-section-head"><h2>最近对话</h2><button className="desk-quiet" type="button" disabled={busy || reading} onClick={start}><Plus size={16} /> 新对话</button></div>
      <div className="agent-thread-list">
        {chats.map((item) => <div className="agent-thread-row" key={item.id} data-current={item.id === chat?.id}>
          <button className="agent-thread" type="button" aria-current={item.id === chat?.id ? 'true' : undefined}
            disabled={busy || reading} onClick={() => open(item.id)} title={item.title}><span>{item.title}</span><small>{date.format(new Date(item.updatedAt))}</small></button>
          <div className="agent-thread-tools">
            <button className="desk-quiet" type="button" aria-label={'重命名：' + item.title} title="重命名" disabled={busy || reading} onClick={() => rename(item)}><Pencil size={15} aria-hidden="true" /></button>
            <button className="desk-quiet" type="button" aria-label={'记住整段对话：' + item.title} title="记住整段对话" disabled={busy || reading || !item.hasMessages} onClick={() => rememberChat(item)}><BookmarkPlus size={17} aria-hidden="true" /></button>
          </div>
        </div>)}
        {!chats.length && <p className="agent-hint">对话会在这里保存。</p>}
      </div>
      <PageControls page={chatPage} busy={busy || reading} navigate={pageChats} label="对话分页" />
    </aside>
    <section className="desk-panel agent-chat" aria-label="小Lu 对话">
      <div className="agent-chat-head">
        <h2>{chat?.title ?? '新对话'}</h2>
        {chat && <div className="desk-actions">
          <button type="button" className="desk-quiet" aria-label="导出对话" title="导出对话" disabled={busy || !messages.length} onClick={exportChat}><Download size={16} /></button>
          <button type="button" className="desk-quiet desk-danger" aria-label="删除对话" title="删除对话" disabled={busy || reading} onClick={remove}><Trash2 size={16} /></button>
        </div>}
      </div>
      <div className="agent-conversation" ref={area}>
        {before && <button type="button" className="desk-quiet agent-older" disabled={busy} onClick={() => older(area.current)}>查看更早消息 <ChevronDown size={15} /></button>}
        {!messages.length && !pending && <div className="agent-intro">
          <span aria-hidden="true"><Sparkles size={26} /></span>
          <h3>你好，我是小Lu。</h3>
          <p>{models.length ? '我是 Lulu 的私人助手。今天想一起想点什么？' : '添加一个模型，就能和小Lu开始对话。'}</p>
          {models.length > 0 && <div>{suggestions.map((idea) => <button key={idea} type="button" className="desk-quiet" disabled={busy} onClick={() => { setInput(idea); composer.current?.focus(); }}>{idea}</button>)}</div>}
        </div>}
        {messages.map((message) => <ChatMessage key={message.seq} {...{ message, busy, remember, edit, dismiss }}
          proposals={proposals.filter(({ messageSeq }) => messageSeq === message.seq)} />)}
        {pending && <ChatMessage message={{ ...pending, role: 'user' }}>
          {sendFailure && <div className="agent-send-error">
            <p role="alert">{sendFailure}</p>
            <div className="desk-actions">
              <button type="button" className="desk-quiet" disabled={busy || !modelId} onClick={retry}>重试</button>
              <button type="button" className="desk-quiet" disabled={busy} onClick={() => { restore(); requestAnimationFrame(() => composer.current?.focus()); }}>重新编辑</button>
            </div>
          </div>}
        </ChatMessage>}
        {thinking && <div className="agent-thinking" role="status">
          <span className="agent-avatar"><Sparkles size={15} aria-hidden="true" /></span>
          <span>小Lu 正在思考</span><span className="agent-dots" aria-hidden="true"><i /><i /><i /></span>
        </div>}
      </div>
      <form className="agent-compose" onSubmit={sendCurrent}>
        <ReferenceTags files={files} remove={busy || reading ? undefined : removeFile} />
        <textarea ref={composer} aria-label="发送给小Lu的消息" rows={2} maxLength={6000} disabled={busy || !!pending || !modelId} value={input} onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) sendCurrent(event); }}
          placeholder={modelId ? '给小Lu发消息…' : '添加模型后开始对话'} />
        <div className="agent-compose-tools">
          <input ref={filePicker} type="file" multiple accept={referenceAccept} hidden onChange={(event) => {
            const selected = Array.from(event.target.files);
            event.target.value = '';
            if (selected.length) attach(selected);
          }} />
          <button type="button" className="agent-attach" aria-label="添加参考文件" title="添加参考文件（PDF、TXT、Markdown、CSV、JSON 等）" disabled={busy || reading || !!pending || !modelId || files.length >= agentReferenceLimits.count}
            onClick={() => filePicker.current.click()}><Paperclip size={17} aria-hidden="true" /><span>参考文件</span></button>
          {reading && <span className="agent-file-status" role="status">正在读取…</span>}
          <div className="agent-compose-end">
            {models.length > 0 ? <label className="agent-model-select">
              <select value={modelId} aria-label="选择模型" disabled={busy} onChange={(event) => setModelId(event.target.value)}>
                {models.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select><ChevronDown size={14} aria-hidden="true" />
            </label> : <button type="button" className="desk-quiet" onClick={toModels}>配置模型</button>}
            <button type="submit" className="agent-send" aria-label="发送消息" title="发送消息" disabled={busy || reading || !!pending || !modelId || (!input.trim() && !files.length)}>
              <ArrowUp size={20} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>
    </section>
  </div>;
}

function MemoryTranscript({ transcript, busy, error, close, older }) {
  return <DeskDialog className="agent-memory-dialog" title={transcript.memory.title} onDismiss={() => { if (!busy) close(); }} busy={busy}>
    <p className="agent-hint">已保存的对话快照 · {transcript.memory.messageCount} 条消息</p>
    {error && <p className="desk-error" role="alert">{error}</p>}
    {transcript.before && <button type="button" className="desk-quiet agent-older" disabled={busy} onClick={older}>
      查看更早消息 <ChevronDown size={15} aria-hidden="true" />
    </button>}
    <div className="agent-transcript-messages">
      {transcript.messages.map((message) => <ChatMessage key={message.seq} message={message} proposals={message.actions}>
        <time className="agent-hint" dateTime={message.createdAt}>{date.format(new Date(message.createdAt))}</time>
      </ChatMessage>)}
    </div>
  </DeskDialog>;
}

export default function WorkbenchAgent({ onApplied }) {
  const [view, setView] = useState('chat');
  const [lists, setLists] = useState(null);
  const [pages, setPages] = useState({});
  const [data, setData] = useState({ chat: null, messages: [], actions: [], before: null });
  const [modelId, setModelId] = useState('');
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [reading, setReading] = useState(false);
  const [pending, setPending] = useState(null);
  const [sendFailure, setSendFailure] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [editor, setEditor] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [reload, setReload] = useState(0);
  const running = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const resources = ['chats', 'memories', 'models', 'actions'];
    const options = { signal: controller.signal };
    Promise.all(resources.map((kind) => get(kind, options))).then(async (responses) => {
      const next = Object.fromEntries(resources.map((kind, i) => [kind, responses[i].items]));
      const pagination = Object.fromEntries(pagedKinds.map((kind) => [kind, { trail: [null], next: responses[resources.indexOf(kind)].next }]));
      const last = next.chats[0] && await get('chats/' + next.chats[0].id, options);
      if (controller.signal.aborted) return;
      setLists(next);
      setPages(pagination);
      setModelId(next.models[0]?.id ?? '');
      if (last) setData(last);
    }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); });
    return () => controller.abort();
  }, [reload]);

  async function act(operation) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try { await operation(); }
    catch (failure) { setError(failure.message); }
    finally { running.current = false; setBusy(false); }
  }
  function switchView(next) {
    setError('');
    setNotice('');
    setView(next);
  }
  function upsert(kind, item) {
    setLists((current) => ({ ...current, [kind]: [item, ...current[kind].filter(({ id }) => id !== item.id)] }));
  }
  function drop(kind, id) {
    setLists((current) => ({ ...current, [kind]: current[kind].filter((item) => item.id !== id) }));
  }

  async function loadPage(kind, trail) {
    const cursor = trail.at(-1);
    const { items, next } = await get(kind + (cursor ? '?cursor=' + encodeURIComponent(cursor) : ''));
    if (!items.length && trail.length > 1) return loadPage(kind, trail.slice(0, -1));
    setLists((current) => ({ ...current, [kind]: items }));
    setPages((current) => ({ ...current, [kind]: { trail, next } }));
    return items;
  }

  function navigate(kind, direction) {
    const page = pages[kind];
    if (!page || (direction === 'next' ? !page.next : page.trail.length <= 1)) return;
    const trail = direction === 'next' ? [...page.trail, page.next] : page.trail.slice(0, -1);
    return act(() => loadPage(kind, trail));
  }

  async function refreshList(kind, trail = [null]) {
    try { return await loadPage(kind, trail); }
    catch {
      setError('变更已生效，重新打开小Lu可刷新列表。');
      return null;
    }
  }

  async function newChat() {
    const { item } = await write('chats', 'POST');
    setData({ chat: item, messages: [], actions: [], before: null });
    await refreshList('chats');
    return item;
  }

  function openChat(id) {
    return act(async () => {
      setData(await get('chats/' + id));
      clearInput();
    });
  }

  function clearInput() {
    setInput('');
    setFiles([]);
    setPending(null);
    setSendFailure('');
  }

  async function attach(selected) {
    if (reading || running.current || pending) return;
    setReading(true);
    setError('');
    const next = [...files];
    const issues = [];
    const slots = agentReferenceLimits.count - files.length;
    try {
      if (selected.length > slots) issues.push('一次最多添加 3 个参考文件。');
      for (const item of selected.slice(0, slots)) {
        const available = agentReferenceLimits.totalChars - next.reduce((sum, file) => sum + file.text.length, 0);
        try { next.push(await readAgentFile(item, available)); }
        catch (failure) { issues.push(`${item.name.slice(0, 180)}：${failure.message}`); }
      }
      setFiles(next);
      if (issues.length) setError(issues.join(' '));
    } finally { setReading(false); }
  }

  function performSend(submission) {
    return act(async () => {
      setPending(submission);
      setSendFailure('');
      setThinking(true);
      try {
        const chat = data.chat ?? await newChat();
        const answer = await write('chats/' + chat.id + '/send', 'POST', {
          ...submission, modelId, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        });
        setData((current) => ({
          ...current, chat: answer.chat, messages: [...current.messages, ...answer.messages],
          actions: [...current.actions, ...(answer.actions ?? (answer.action ? [answer.action] : []))],
        }));
        setPending(null);
        await refreshList('chats');
      } catch (failure) { setSendFailure(failure.message); }
      finally { setThinking(false); }
    });
  }

  function send() {
    if (running.current || reading || pending || !modelId || (!input.trim() && !files.length)) return;
    const submission = { requestId: crypto.randomUUID(), content: input.trim(), references: files };
    setInput('');
    setFiles([]);
    return performSend(submission);
  }

  function restore() {
    setInput(pending.content);
    setFiles(pending.references);
    setPending(null);
    setSendFailure('');
  }

  function removeChat() {
    const { id, title } = data.chat;
    setConfirmation({
      title: '删除「' + title + '」？', detail: '将删除该对话及未确认的操作草稿。',
      action: () => act(async () => {
        await get('chats/' + id, { method: 'DELETE' });
        drop('chats', id);
        const items = await refreshList('chats', pages.chats.trail);
        const next = items?.[0];
        setData(next ? await get('chats/' + next.id) : { chat: null, messages: [], actions: [], before: null });
        clearInput();
      }),
    });
  }

  function loadOlder(container) {
    return act(async () => {
      const { scrollHeight, scrollTop } = container;
      const next = await get('chats/' + data.chat.id + '?before=' + data.before);
      setData((current) => ({ ...current, messages: [...next.messages, ...current.messages], actions: [...next.actions, ...current.actions], before: next.before }));
      requestAnimationFrame(() => { container.scrollTop = container.scrollHeight - scrollHeight + scrollTop; });
    });
  }

  function exportChat() {
    return act(async () => {
      let page = await get('chats/' + data.chat.id);
      const pages = [page.messages];
      while (page.before) {
        page = await get('chats/' + data.chat.id + '?before=' + page.before);
        pages.unshift(page.messages);
      }
      const contents = ['# ' + data.chat.title, ...pages.flat().map(({ role, modelName, content, references, createdAt }) => {
        const author = role === 'user' ? '我' : '小Lu' + (modelName ? `（${modelName}）` : '');
        const filenames = references?.length ? '\n\n参考文件：' + references.map(({ name }) => name).join('、') : '';
        return '## ' + author + ' · ' + date.format(new Date(createdAt)) + '\n\n' + content + filenames;
      })].join('\n\n');
      const url = URL.createObjectURL(new Blob([contents], { type: 'text/markdown;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lululab-' + data.chat.id + '.md';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  function edit(type, item) {
    setError('');
    setNotice('');
    setEditor({ type, item });
  }

  function rememberConversation(item) {
    return act(async () => {
      const { updated } = await write('chats/' + item.id + '/remember', 'POST');
      await refreshList('memories');
      setNotice(updated ? '已更新这段对话的记忆。' : '已保存整段对话，可在「记忆」查看全文。');
    });
  }

  function openTranscript(item) {
    return act(async () => setTranscript(await get('memories/' + item.id + '/transcript')));
  }

  function olderTranscript() {
    return act(async () => {
      const next = await get('memories/' + transcript.memory.id + '/transcript?before=' + transcript.before);
      setTranscript({ ...next, messages: [...next.messages, ...transcript.messages] });
    });
  }

  async function decide(item, decision, values) {
    const { action } = await write('actions/' + item.id + '/' + decision, 'POST', values);
    setData((current) => ({ ...current, actions: current.actions.map((row) => row.id === action.id ? action : row) }));
    if (action.status === 'confirmed') {
      await onApplied(action);
      await refreshList('actions');
    }
  }

  function saveEditor(values) {
    return act(async () => {
      const { type, item } = editor;
      if (type === 'action') await decide(item, 'confirm', values);
      else if (type === 'rename') {
        const { item: renamed } = await write('chats/' + item.id, 'PUT', { title: values.title });
        setData((current) => current.chat?.id === renamed.id ? { ...current, chat: { ...current.chat, ...renamed } } : current);
        await refreshList('chats', pages.chats.trail);
        setNotice('对话已重命名。');
      }
      else {
        const response = await write(type + (item?.id ? '/' + item.id : ''), item?.id ? 'PUT' : 'POST', values);
        if (type === 'models') {
          upsert(type, response.item);
          if (!modelId) setModelId(response.item.id);
        } else await refreshList('memories');
        setNotice('已保存。');
      }
      setEditor(null);
    });
  }

  function removeItem(kind, item) {
    const isAction = kind === 'actions';
    const name = isAction ? item.values.name || labels[item.kind] : item.name ?? item.title;
    setConfirmation({ title: isAction ? '删除「' + name + '」的操作记录？' : '删除「' + name + '」？',
      detail: isAction ? '记录会从列表移除。已写入的待办、笔记等内容仍会保留。' : undefined,
      action: () => act(async () => {
        await get(kind + '/' + item.id, { method: 'DELETE' });
        drop(kind, item.id);
        if (kind === 'memories' || isAction) await refreshList(kind, pages[kind].trail);
        if (isAction) setNotice('已删除操作记录。');
        if (kind === 'models' && item.id === modelId) setModelId(lists.models.find(({ id }) => id !== item.id)?.id ?? '');
      }),
    });
  }

  if (!lists) return <div className="desk-empty"><p role="status">{error || '正在打开小Lu…'}</p>
    {error && <button className="desk-button" type="button" onClick={() => { setError(''); setReload((n) => n + 1); }}>重新读取</button>}</div>;

  return <div className="agent-workspace">
    <nav className="desk-tabs agent-tabs" aria-label="小Lu 功能">
      {tabs.map(([id, label, Icon]) => <button key={id} type="button" aria-current={view === id ? 'page' : undefined} disabled={busy || reading}
        onClick={() => switchView(id)}><Icon size={16} aria-hidden="true" />{label}</button>)}
    </nav>
    {error && !editor && !transcript && <p className="desk-error agent-feedback" role="alert">{error}</p>}
    {notice && <p className="agent-feedback agent-success" role="status"><Check size={16} />{notice}</p>}
    {view === 'chat' && <ChatPanel state={{ ...lists, ...data, proposals: data.actions, busy, thinking, pending, sendFailure, reading, chatPage: pages.chats }}
      selections={{ modelId, input, setInput, setModelId, files }} handlers={{
        start: () => act(async () => { await newChat(); clearInput(); }), open: openChat, older: loadOlder, send, remove: removeChat, exportChat,
        attach, removeFile: (index) => setFiles((list) => list.filter((_, i) => i !== index)), retry: () => performSend(pending), restore,
        rename: (item) => edit('rename', item), rememberChat: rememberConversation, pageChats: (direction) => navigate('chats', direction),
        edit: (item) => edit('action', item), dismiss: (item) => act(() => decide(item, 'dismiss', {})),
        remember: (message) => edit('memories', { title: message.content.split('\n')[0].slice(0, 50), body: message.content.slice(0, 4000) }),
        toModels: () => switchView('models'),
      }} />}
    {(view === 'models' || view === 'memories') && <ResourceList {...{ view, busy }} items={lists[view]} edit={(item) => edit(view, item)} remove={(item) => removeItem(view, item)}
      read={openTranscript} page={pages.memories} navigate={(direction) => navigate('memories', direction)}
      test={(item) => act(async () => { await write('models/' + item.id + '/test', 'POST'); setNotice('连接成功，模型已返回文本。'); })} />}
    {view === 'actions' && <section className="desk-panel agent-resources" aria-label="已执行操作">
      <div className="agent-section-head"><h2>已执行操作</h2></div>
      {!lists.actions.length && <p className="agent-empty">已确认并执行的站内操作会显示在这里。</p>}
      {lists.actions.map((item) => <ActionCard key={item.id} item={item} busy={busy} remove={(entry) => removeItem('actions', entry)} />)}
      <PageControls page={pages.actions} busy={busy} navigate={(direction) => navigate('actions', direction)} label="操作记录分页" />
    </section>}
    {editor && <Editor {...{ editor, busy, error }} close={() => { setError(''); setEditor(null); }} save={saveEditor} />}
    {transcript && <MemoryTranscript {...{ transcript, busy, error }} close={() => { setError(''); setTranscript(null); }} older={olderTranscript} />}
    {confirmation && <DeskConfirm {...confirmation} label="删除" onDismiss={() => setConfirmation(null)} />}
  </div>;
}
