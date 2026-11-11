import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, CircleDot, FolderOpen, Gamepad2, Blocks, Radio, UserRound } from 'lucide-react';
import CursorTrail from './components/CursorTrail';
import { LabOrbit, LabRegistration } from './components/LabMotion';
import LabStack from './components/LabStack';
import LabCategoryNav from './components/LabCategoryNav';
import LabImageViewer from './components/LabImageViewer';
import LabProjectShowcase from './components/LabProjectShowcase';
import LabAbout from './components/LabAbout';
import { NewsPage } from './components/LabServices';
import ArchitectureGuide from './components/ArchitectureGuide';
import { ChatGPTCodexGuide, ExtensionSystemGuide } from './components/KnowledgeGuides';
import { defaultHome, agentSkills, authorProfiles } from './data/labContent';
import { useCatalog } from './data/catalog';
import './App.css';
import './Explore.css';
import './Guide.css';
import './Lab.css';

const Workbench = lazy(() => import('./components/Workbench'));
const SharePage = lazy(() => import('./components/SharePage'));

const sections = [
  { path: '/', label: '首页' },
  { path: '/projects', label: '项目', icon: FolderOpen, detail: '产品与实践' },
  { path: '/games', label: '游戏', icon: Gamepad2, detail: '游戏与原型' },
  { path: '/skills', label: 'Skills', icon: Blocks, detail: 'Agent 技能' },
  { path: '/share', label: '分享', icon: BookOpen, detail: '文档与指南' },
  { path: '/aihot', label: 'AI热点', icon: Radio, detail: 'AI 资讯观察' },
  { path: '/about', label: '关于', icon: UserRound, detail: 'Lulu 的个人介绍' },
];

export const External = ({ href, children, className = 'lab-link' }) => <a className={className} href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={16} /></a>;

function Topbar({ path }) {
  return <header className="lab-header">
    <a href="/" className="lab-brand" aria-label="LULU LAB 首页"><CircleDot size={25} /><strong>LULU<span> LAB</span></strong></a>
    <nav aria-label="主导航">{sections.map(({ path: link, label }) => <a key={link} href={link} aria-current={path === link || (link !== '/' && path.startsWith(`${link}/`)) ? 'page' : undefined}>{label}</a>)}</nav>
    <span className="lab-header-domain">LULULAB.SITE</span>
  </header>;
}

function Home() {
  const [home, setHome] = useState(defaultHome);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const response = await fetch('/api/home', { signal: controller.signal, cache: 'no-store' });
        if (response.ok) setHome({ ...defaultHome, ...(await response.json()) });
      } catch { /* The compiled introduction remains available on static previews. */ }
    };
    refresh();
    window.addEventListener('pageshow', refresh);
    const interval = setInterval(() => { if (!document.hidden) refresh(); }, 30_000);
    return () => { controller.abort(); clearInterval(interval); window.removeEventListener('pageshow', refresh); };
  }, []);
  return <main id="main-content" className="lab-home">
    <div className="lab-home-layout">
      <div className="lab-home-copy">
        <p className="lab-kicker"><span />{home.eyebrow}</p>
        <h1>LULU<span> LAB</span><i>.</i></h1>
        <h2>{home.headline}</h2>
        <p className="lab-home-description">{home.description}</p>
      </div>
    </div>
    <div className="lab-home-index" aria-label="模块索引">{sections.slice(1).map(({ path, label, icon: Icon, detail }, index) => <a href={path} key={path}>
      <span className="lab-index-number">0{index + 1}</span><Icon size={18} /><span><strong>{label}</strong><small>{detail}</small></span><ArrowUpRight className="lab-index-arrow" size={15} />
    </a>)}</div>
    <footer className="lab-home-rail"><span><i />{home.status}</span><LabRegistration /><a className="lab-home-footer-link" href="#lab-footer">翻到页脚 <ArrowDown size={14} /></a></footer>
  </main>;
}

export function PageHeading({ number, eyebrow, title, children }) {
  return <header className="lab-page-heading"><p className="lab-kicker"><span />{number} / {eyebrow}</p><h1>{title}<i>.</i></h1><p>{children}</p></header>;
}

const tags = (items) => items?.length > 0 && <ul className="lab-tags" aria-label="技术与关键词">{items.map((item) => <li key={item}>{item}</li>)}</ul>;

function Projects({ projects, project, selectProject }) {
  return <main id="main-content" className="lab-page">
    <PageHeading number="01" eyebrow="PROJECT ARCHIVE" title="项目">选一个项目，看看它解决了什么问题、如何运转，以及用到哪些技术。</PageHeading>
    {project ? <div className="lab-catalog-layout">
      <LabCategoryNav caption="PROJECTS" label="切换项目" value={project.id} onChange={selectProject}
        items={projects.map(({ id, name }) => ({ id, label: name, href: `/projects/${id}` }))} />
      <ProjectDetail key={project.id} project={project} />
    </div> : <p className="lab-empty">暂无公开项目。</p>}
  </main>;
}

function ProjectDetail({ project }) {
  const [qrOpen, setQrOpen] = useState(false);
  const qrDescription = `${project.name}微信小程序码`;
  return <article className="lab-project-detail" aria-labelledby="lab-project-name">
    <header className="lab-project-intro">
      <div className="lab-project-copy">
        <p className="lab-kicker">PROJECT / {project.id.toUpperCase()}</p>
        <div className="lab-project-title">
          <h2 id="lab-project-name">{project.name}</h2>
          {project.href && <External href={project.href} className="lab-project-visit">立即访问</External>}
        </div>
        <p>{project.overview}</p>
        {project.platformSummary && <p>{project.platformSummary}</p>}
        {tags(project.technologies)}
      </div>
      {project.qrCode && <figure className="lab-project-qr">
        <button type="button" className="lab-image-trigger" aria-label={`放大${qrDescription}`} aria-haspopup="dialog" onClick={() => setQrOpen(true)}><img src={project.qrCode} alt={qrDescription} width="258" height="258" /></button>
        <figcaption><strong>微信扫一扫体验</strong><span>点击小程序码放大查看</span></figcaption>
      </figure>}
    </header>
    {qrOpen && <LabImageViewer src={project.qrCode} alt={qrDescription} onDismiss={() => setQrOpen(false)} />}
    <LabProjectShowcase project={project} />
  </article>;
}

function Games({ games }) {
  const [selected, setSelected] = useState(null);
  const items = games.map((game) => ({ ...game, id: game.id ?? game.name }));
  const game = items.find(({ id }) => id === selected) ?? items[0];
  return <main id="main-content" className="lab-page">
    <PageHeading number="02" eyebrow="PLAYGROUND" title="游戏">用小游戏试验新的玩法、交互和视觉想法。</PageHeading>
    {game ? <div className="lab-catalog-layout">
      <LabCategoryNav caption="GAMES" label="切换游戏" value={game.id} onChange={setSelected} items={items.map(({ id, name }) => ({ id, label: name }))} />
      <article className="lab-entry-panel"><Gamepad2 size={30} aria-hidden="true" /><h2>{game.name}</h2><p>{game.description}</p>{game.href && <External href={game.href}>开始游戏</External>}</article>
    </div> : <div className="lab-empty lab-game-empty"><Gamepad2 size={36} /><p className="lab-kicker">PLAYTEST / 00</p><h2>游戏还在筹备中</h2><p>有可分享的原型后，会在这里发布试玩入口和制作笔记。</p></div>}
  </main>;
}

function Skills() {
  const [selected, setSelected] = useState(null);
  const available = agentSkills.filter((skill) => skill.published === true && (skill.github || skill.gitee));
  const skill = available.find(({ id }) => id === selected) ?? available[0];
  return <main id="main-content" className="lab-page">
    <PageHeading number="03" eyebrow="AGENT SKILLS" title="Skills">把反复验证的做事方法，整理成 Agent 可以复用的技能。</PageHeading>
    <div className="lab-profile-strip"><span>我的开源主页</span><div className="lab-card-links"><External href={authorProfiles.github}>GitHub / Adore1224</External><External href={authorProfiles.gitee}>Gitee / wpc_123</External></div></div>
    {skill ? <div className="lab-catalog-layout">
      <LabCategoryNav caption="SKILLS" label="切换技能" value={skill.id} onChange={setSelected} items={available.map(({ id, name }) => ({ id, label: name }))} />
      <article className="lab-entry-panel"><Blocks size={30} aria-hidden="true" /><h2>{skill.name}</h2><p>{skill.description}</p>{tags(skill.tags)}
        <div className="lab-card-links">{skill.github && <External href={skill.github}>GitHub</External>}{skill.gitee && <External href={skill.gitee}>Gitee</External>}</div>
      </article>
    </div> : <section className="lab-skill-empty"><span className="lab-skill-empty-index" aria-hidden="true">00</span><div><p className="lab-kicker">NOT PUBLISHED YET</p><h2>还没有公开的技能</h2><p>有经过实践、适合分享的 Agent 技能后，会在这里发布说明和源码链接。</p></div></section>}
  </main>;
}

const oldGuides = {
  '/explore/commercial-architecture': ArchitectureGuide,
  '/explore/chatgpt-codex-workflow': ChatGPTCodexGuide,
  '/explore/mcp-skills-plugins': ExtensionSystemGuide,
};

function readPath() {
  const rawPath = location.pathname.replace(/\/+$/, '') || '/';
  if (rawPath === '/explore') return '/share';
  return rawPath === '/repositories' ? '/skills' : rawPath;
}

export default function LabApp() {
  const [path, setPath] = useState(readPath);
  useEffect(() => {
    const sync = () => setPath(readPath());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  function selectProject(id, event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const next = `/projects/${id}`;
    if (path !== next) {
      history.pushState(null, '', next);
      setPath(next);
    }
  }

  const privatePage = path === '/workbench';
  const shareDocument = /^\/share\/([a-z0-9][a-z0-9-]{0,63})$/.exec(path)?.[1];
  const projectDetail = path.startsWith('/projects/');
  const { loading, projects, games } = useCatalog(path === '/projects' || path === '/games' || projectDetail);
  const project = projectDetail ? projects.find(({ id }) => path === `/projects/${id}`) : null;
  const OldGuide = oldGuides[path];
  const title = privatePage ? '个人工作台' : project?.name ?? sections.find((section) => section.path === path)?.label ?? (shareDocument || OldGuide ? '分享' : '页面未找到');
  useEffect(() => { document.title = `${title} · LULU LAB`; }, [title]);
  let content;
  if (privatePage) content = <Suspense fallback={<main id="main-content" className="lab-page" role="status">正在载入工作台…</main>}><Workbench /></Suspense>;
  else if (loading) content = <main id="main-content" className="lab-page" role="status">正在读取资料…</main>;
  else if (path === '/') content = <Home />;
  else if (path === '/projects' || project) content = <Projects {...{ projects, selectProject }} project={project ?? projects[0]} />;
  else if (path === '/games') content = <Games games={games} />;
  else if (path === '/skills') content = <Skills />;
  else if (path === '/share' || shareDocument) content = <Suspense fallback={<main id="main-content" className="lab-page" role="status">正在载入分享…</main>}><SharePage key={path} documentId={shareDocument} /></Suspense>;
  else if (path === '/aihot') content = <NewsPage />;
  else if (path === '/about') content = <LabAbout />;
  else if (OldGuide) content = <OldGuide />;
  else content = <main id="main-content" className="lab-page"><PageHeading number="404" eyebrow="NOT FOUND" title="页面未找到">这个地址没有对应的内容。</PageHeading><a className="lab-button" href="/">返回首页 <ArrowRight size={16} /></a></main>;
  return <div className={`lab-shell${path === '/' ? ' is-home' : ''}`}>
    {!privatePage && <><LabOrbit /><CursorTrail /></>}<LabStack header={!privatePage && <Topbar path={OldGuide ? '/share' : path} />} enabled={!privatePage} home={path === '/'} scrollKey={path}>{content}</LabStack>
  </div>;
}
