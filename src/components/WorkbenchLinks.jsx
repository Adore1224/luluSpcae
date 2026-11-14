import { useState } from 'react';
import { ArrowUpRight, Globe2, Plus, Star } from 'lucide-react';
import { matchSearch } from '../data/workbench';
import { DeskEmpty, Search } from './WorkbenchUi';

export function Bookmarks({ items, openEditor, remove, busy }) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const groups = [...new Set(items.map(({ category }) => category).filter(Boolean))];
  const activeGroup = groups.includes(group) ? group : '';
  const filtered = items.filter((item) => (!activeGroup || item.category === activeGroup) && matchSearch(query, item.name, item.href, item.description, item.category))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  return <>
    <div className="desk-tools desk-bookmark-tools">
      <div className="desk-actions">
        <select aria-label="网站分组" value={activeGroup} onChange={(event) => setGroup(event.target.value)}><option value="">全部分组</option>{groups.map((category) => <option key={category}>{category}</option>)}</select>
        <Search label="搜索星标网站" value={query} onChange={setQuery} />
      </div>
      <button type="button" className="desk-button" onClick={() => openEditor('bookmarks')}><Plus size={16} /> 添加网站</button>
    </div>
    {filtered.length ? <div className="desk-card-grid">{filtered.map((item) => <article className="desk-panel desk-bookmark" key={item.id}>
      <a className="desk-card-open" href={item.href} target="_blank" rel="noreferrer">
        <div className="desk-row"><span className="desk-record-icon"><Globe2 size={19} /></span><ArrowUpRight size={18} /></div>
        <h2>{item.name}</h2><small>{new URL(item.href).host}</small><p>{item.description}</p>
      </a>
      <div className="desk-row">
        <div className="desk-actions">{item.category && <span className="desk-pill">{item.category}</span>}{item.pinned && <span className="desk-pill" data-live="true">置顶</span>}</div>
        <div className="desk-actions"><button type="button" className="desk-quiet" onClick={() => openEditor('bookmarks', item)}>编辑</button><button type="button" className="desk-quiet desk-danger" disabled={busy} onClick={() => remove('bookmarks', item)}>删除</button></div>
      </div>
    </article>)}</div> : <DeskEmpty icon={Star}>{query || activeGroup ? '没有匹配的网站。' : '添加常用网站，点击卡片就能在新标签页打开。'}</DeskEmpty>}
  </>;
}
