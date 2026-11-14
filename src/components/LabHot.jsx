import { useState } from 'react';
import { AiHotPanel } from './LabServices';
import { GitHotPanel, WebHotPanel } from './LabHotBoards';
import './LabHot.css';

const sections = [
  { id: 'ai', label: 'AI热点', Panel: AiHotPanel },
  { id: 'git', label: 'Git热点', Panel: GitHotPanel },
  { id: 'web', label: '网络热点', Panel: WebHotPanel },
];

export default function LabHot() {
  const [active, setActive] = useState('ai');
  const { Panel } = sections.find(({ id }) => id === active);
  return <main id="main-content" className="lab-page">
    <header className="lab-page-heading lab-hot-heading">
      <p className="lab-kicker"><span />04 / HOT TOPICS</p>
      <h1 className="lab-hot-title">热点</h1>
      <nav aria-label="热点分类">
        {sections.map(({ id, label }) => <button type="button" key={id} aria-pressed={active === id}
          onClick={() => setActive(id)}>{label}</button>)}
      </nav>
      {active === 'ai' && <p>一份简洁的 AI 资讯索引，沿着标题和摘要，回到消息的出处。</p>}
    </header>
    <Panel />
  </main>;
}
