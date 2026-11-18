import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, ListTodo, NotebookPen, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import WorkbenchVisitors from './WorkbenchVisitors';
import './WorkbenchDashboard.css';

const fullDate = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'full' });
const monthLabel = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' });
const dayLabel = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
const timeLabel = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const timeZone = timeLabel.resolvedOptions().timeZone;
const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

function dateKey(date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part, i) => String(part).padStart(i === 0 ? 4 : 2, '0')).join('-');
}

function Calendar({ month, setMonth, today, selected, select, counts }) {
  const year = month.getFullYear();
  const index = month.getMonth();
  const first = new Date(year, index, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, index + 1, 0).getDate();

  return <section className="desk-panel dashboard-card dashboard-calendar-card" aria-labelledby="desk-calendar-heading">
    <div className="dashboard-card-head">
      <h2 id="desk-calendar-heading"><CalendarDays size={19} aria-hidden="true" /> 日历</h2>
      <button className="desk-quiet" type="button" onClick={() => { setMonth(new Date(`${today}T12:00:00`)); select(today); }}>回到今天</button>
    </div>
    <div className="dashboard-month">
      <button className="desk-quiet" type="button" aria-label="上个月" onClick={() => setMonth(new Date(year, index - 1, 1))}><ChevronLeft size={18} aria-hidden="true" /></button>
      <strong aria-live="polite">{monthLabel.format(month)}</strong>
      <button className="desk-quiet" type="button" aria-label="下个月" onClick={() => setMonth(new Date(year, index + 1, 1))}><ChevronRight size={18} aria-hidden="true" /></button>
    </div>
    <div className="dashboard-calendar">
      {weekdays.map((day) => <span key={day} className="dashboard-weekday">{day}</span>)}
      {Array.from({ length: offset }, (_, i) => <span key={`empty-${i}`} aria-hidden="true" />)}
      {Array.from({ length: days }, (_, i) => {
        const date = new Date(year, index, i + 1);
        const key = dateKey(date);
        const count = counts.get(key) ?? 0;
        return <button key={key} type="button" aria-pressed={key === selected} aria-current={key === today ? 'date' : undefined}
          aria-label={`${fullDate.format(date)}${count ? `，${count} 项安排` : ''}`} onClick={() => select(key)}>
          {i + 1}{count > 0 && <i aria-hidden="true" />}
        </button>;
      })}
    </div>
  </section>;
}

function AgendaList({ title, items, empty, busy, toggle, edit, remove }) {
  return <div className="dashboard-agenda-group">
    <h3>{title}</h3>
    {items.length === 0 ? <p>{empty}</p> : <ul>
      {items.map((item) => <li key={item.id}>
        <label className="dashboard-agenda-entry" data-done={item.done}>
          <input type="checkbox" checked={item.done} disabled={busy} onChange={(event) => toggle(item, event.target.checked)} />
          {item.time && <time dateTime={item.time}>{item.time}</time>}
          <span>{item.name}</span>
        </label>
        <button className="desk-quiet" type="button" aria-label={`编辑 ${item.name}`} disabled={busy} onClick={() => edit(item)}><Pencil size={15} aria-hidden="true" /></button>
        <button className="desk-quiet desk-danger" type="button" aria-label={`删除 ${item.name}`} disabled={busy} onClick={() => remove('agenda', item)}><Trash2 size={15} aria-hidden="true" /></button>
      </li>)}
    </ul>}
  </div>;
}

export default function WorkbenchDashboard({ records, ready, save, remove }) {
  const [now, setNow] = useState(() => new Date());
  const [month, setMonth] = useState(now);
  const [selected, setSelected] = useState(() => dateKey(now));
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const today = dateKey(now);

  useEffect(() => {
    const refresh = () => {
      const next = new Date();
      setNow((previous) => Math.floor(next.getTime() / 60_000) === Math.floor(previous.getTime() / 60_000) ? previous : next);
    };
    const timer = setInterval(refresh, 1000);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);

  const counts = new Map();
  const schedule = [];
  const tasks = [];
  for (const item of records.agenda ?? []) {
    counts.set(item.date, (counts.get(item.date) ?? 0) + 1);
    if (item.date === selected) (item.time ? schedule : tasks).push(item);
  }
  schedule.sort((a, b) => a.time.localeCompare(b.time));
  tasks.sort((a, b) => Number(a.done) - Number(b.done));
  const completed = tasks.filter((item) => item.done).length;
  const hour = now.getHours();
  const greeting = hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

  function select(date) {
    if (busy || date === selected) return;
    setSelected(date);
    setDraft(null);
    setError('');
  }

  function edit(item) {
    setError('');
    setDraft(item);
  }

  async function persist(item, closeEditor = false) {
    setBusy(true);
    setError('');
    try {
      await save('agenda', item);
      if (closeEditor) setDraft(null);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }

  const listActions = { busy, toggle: (item, done) => persist({ ...item, done }), edit, remove };
  return <div className="desk-dashboard">
    <section className="dashboard-welcome" aria-labelledby="desk-greeting">
      <div>
        <p>{fullDate.format(now)}</p>
        <h2 id="desk-greeting">{greeting}，Lulu。</h2>
      </div>
      <div className="dashboard-clock">
        <span><Clock3 size={15} aria-hidden="true" /> 本地时间</span>
        <time dateTime={timeLabel.format(now)}>{timeLabel.format(now)}</time>
        <span>{timeZone}</span>
      </div>
    </section>
    <div className="dashboard-planner">
      <Calendar {...{ month, setMonth, today, selected, select, counts }} />
      <section className="desk-panel dashboard-card dashboard-plan" aria-labelledby="desk-plan-heading">
        <div className="dashboard-card-head">
          <div><h2 id="desk-plan-heading"><ListTodo size={19} aria-hidden="true" /> {selected === today ? '今日安排' : '当日安排'}</h2>
            <p>{dayLabel.format(new Date(`${selected}T12:00:00`))}</p></div>
          <button className="desk-button" type="button" disabled={!ready || busy || draft !== null}
            onClick={() => edit({ date: selected, name: '', time: '', done: false })}><Plus size={16} aria-hidden="true" /> 添加安排</button>
        </div>
        <div className="dashboard-plan-body" tabIndex={0} role="region" aria-label="日程和待办">
          {draft && <form className="desk-form dashboard-agenda-form" onSubmit={(event) => { event.preventDefault(); void persist(draft, true); }}>
            <label>安排名称<input required autoFocus maxLength={100} value={draft.name} disabled={busy} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label>时间（留空为待办）<input type="time" value={draft.time} disabled={busy} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></label>
            <div className="desk-actions">
              <button className="desk-button" disabled={busy || !draft.name.trim()}>保存</button>
              <button className="desk-quiet" type="button" disabled={busy} onClick={() => { setDraft(null); setError(''); }}>取消</button>
            </div>
          </form>}
          {error && <p className="desk-error" role="alert">{error}</p>}
          {ready && <>
            <AgendaList title={`日程 · ${schedule.length} 项`} items={schedule} empty="这一天暂无定时日程。" {...listActions} />
            <AgendaList title={`待办 · ${completed}/${tasks.length} 已完成`} items={tasks} empty="这一天暂无待办。" {...listActions} />
          </>}
        </div>
      </section>
    </div>
    <div className="dashboard-overview">
      <WorkbenchVisitors />
      <section className="desk-panel dashboard-card dashboard-library" aria-labelledby="desk-library-heading">
        <h2 id="desk-library-heading">工作台一览</h2>
        <dl>
          <div><dt><Star size={15} aria-hidden="true" /> 星标网站</dt><dd>{ready ? records.bookmarks.length : '—'}</dd></div>
          <div><dt><NotebookPen size={15} aria-hidden="true" /> 灵感笔记</dt><dd>{ready ? records.notes.length : '—'}</dd></div>
        </dl>
      </section>
    </div>
  </div>;
}
