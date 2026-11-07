import { useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, CircleDot, FolderOpen, Gamepad2, Blocks, Radio, UserRound } from 'lucide-react';
import CursorTrail from './components/CursorTrail';
import { LabOrbit, LabRegistration } from './components/LabMotion';
import LabStack from './components/LabStack';
import LabCategoryNav from './components/LabCategoryNav';
import LabAbout from './components/LabAbout';
import { NewsPage, Workbench } from './components/LabServices';
import ExploreCenter from './components/ExploreCenter';
import ArchitectureGuide from './components/ArchitectureGuide';
import { ChatGPTCodexGuide, ExtensionSystemGuide } from './components/KnowledgeGuides';
import { defaultHome, games, agentSkills, authorProfiles } from './data/labContent';
import { projects } from './data/siteContent';
import './App.css';
import './Explore.css';
import './Guide.css';
import './Lab.css';

const sections = [
  { path: '/', label: '首页' },
  { path: '/projects', label: '项目', icon: FolderOpen, detail: '产品与实践' },
  { path: '/games', label: '游戏', icon: Gamepad2, detail: '游戏与原型' },
  { path: '/skills', label: 'Skills', icon: Blocks, detail: 'Agent 技能' },
  { path: '/aihot', label: 'AIHot', icon: Radio, detail: 'AI 资讯观察' },
  { path: '/about', label: '关于', icon: UserRound, detail: 'Lulu 的个人介绍' },
];

export const External = ({ href, children }) => <a className="lab-link" href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={16} /></a>;

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

const tags = (items) => <ul className="lab-tags">{items.map((item) => <li key={item}>{item}</li>)}</ul>;

function Projects() {
  const [filter, setFilter] = useState('全部');
  const options = ['全部', ...new Set(projects.map(({ projectType }) => projectType))];
  const items = projects.filter(({ projectType }) => filter === '全部' || projectType === filter);
  return <main id="main-content" className="lab-page">
    <PageHeading number="01" eyebrow="PROJECT ARCHIVE" title="项目">产品、工程实践和个人实验。每个项目都保留了功能简介、技术栈和界面记录。</PageHeading>
    <div className="lab-catalog-layout">
    <LabCategoryNav caption="COLLECTIONS" label="筛选项目" value={filter} onChange={setFilter} items={options.map((option) => ({ id: option, label: option, count: option === '全部' ? projects.length : projects.filter((project) => project.projectType === option).length }))} />
    <div className="lab-project-grid">{items.map((project) => <article className="lab-project" key={project.id}>
      <a className="lab-project-cover" href={`/projects/${project.id}`} aria-label={`查看 ${project.name}`}><img src={project.gallery[0].image} alt="" loading="lazy" className={project.imageFit === 'contain' ? 'is-portrait' : ''} /></a>
      <div className="lab-project-body"><p className="lab-kicker">{project.projectType} / {project.id.toUpperCase()}</p><h2><a href={`/projects/${project.id}`}>{project.name}</a></h2><p className="lab-project-summary">{project.overview}</p>{tags(project.technologies.slice(0, 4))}
        <div className="lab-card-links"><a className="lab-link" href={`/projects/${project.id}`}>项目详情 <ArrowRight size={16} /></a>{project.href && <External href={project.href}>访问项目</External>}</div>
      </div>
    </article>)}</div></div>
  </main>;
}

function ProjectDetail({ project }) {
  const [index, setIndex] = useState(0);
  const picture = project.gallery[index];
  return <main id="main-content" className="lab-page lab-project-detail">
    <a href="/projects" className="lab-link"><ArrowLeft size={16} /> 返回项目</a>
    <PageHeading number="01" eyebrow={project.id.toUpperCase()} title={project.name}>{project.overview}</PageHeading>
    <div className="lab-project-meta">{tags(project.technologies)}{project.href ? <External href={project.href}>访问项目</External> : <span>{project.id === 'mscc' ? '微信小程序 · 无网页链接' : '暂无公开访问链接'}</span>}</div>
    <section className="lab-gallery" aria-label="项目截图">
      <figure><a href={picture.image} target="_blank" rel="noreferrer" aria-label="在新标签页查看原图"><img src={picture.image} alt={picture.description} /></a><figcaption><span>{String(index + 1).padStart(2, '0')} / {String(project.gallery.length).padStart(2, '0')}</span>{picture.description}</figcaption></figure>
      <div className="lab-thumbnails">{project.gallery.map((shot, i) => <button type="button" key={shot.image} aria-pressed={index === i} aria-label={`查看截图 ${i + 1}`} onClick={() => setIndex(i)}><img src={shot.image} alt="" loading="lazy" /></button>)}</div>
    </section>
  </main>;
}

function Games() {
  return <main id="main-content" className="lab-page">
    <PageHeading number="02" eyebrow="PLAYGROUND" title="游戏">用小游戏试验新的玩法、交互和视觉想法。</PageHeading>
    {games.length ? <div className="lab-project-grid">{games.map((game) => <article className="lab-empty" key={game.name}><h2>{game.name}</h2><p>{game.description}</p>{game.href && <External href={game.href}>开始游戏</External>}</article>)}</div> : <div className="lab-empty lab-game-empty"><Gamepad2 size={36} /><p className="lab-kicker">PLAYTEST / 00</p><h2>游戏还在筹备中</h2><p>有可分享的原型后，会在这里发布试玩入口和制作笔记。</p></div>}
  </main>;
}

function Skills() {
  const [platform, setPlatform] = useState('all');
  const available = agentSkills.filter((skill) => skill.published === true && (skill.github || skill.gitee));
  const items = available.filter((skill) => platform === 'all' || Boolean(skill[platform]));
  const platforms = [{ id: 'all', label: '全部技能' }, { id: 'github', label: 'GitHub' }, { id: 'gitee', label: 'Gitee' }];
  return <main id="main-content" className="lab-page">
    <PageHeading number="03" eyebrow="AGENT SKILLS" title="Skills">把反复验证的做事方法，整理成 Agent 可以复用的技能。</PageHeading>
    <div className="lab-profile-strip"><span>我的开源主页</span><div className="lab-card-links"><External href={authorProfiles.github}>GitHub / Adore1224</External><External href={authorProfiles.gitee}>Gitee / wpc_123</External></div></div>
    <div className="lab-catalog-layout"><LabCategoryNav caption="PLATFORMS" label="技能平台" value={platform} onChange={setPlatform} items={platforms.map((item) => ({ ...item, count: available.filter((skill) => item.id === 'all' || skill[item.id]).length }))} />
    {items.length ? <div className="lab-skill-grid">{items.map((skill) => <article className="lab-skill-card" key={skill.id}><Blocks size={24} /><h2>{skill.name}</h2><p>{skill.description}</p>{tags(skill.tags ?? [])}<div className="lab-card-links">{skill.github && <External href={skill.github}>GitHub</External>}{skill.gitee && <External href={skill.gitee}>Gitee</External>}</div></article>)}</div> : <section className="lab-skill-empty"><span className="lab-skill-empty-index">00</span><div><p className="lab-kicker">NOT PUBLISHED YET</p><h2>{available.length ? '此平台还没有公开技能' : '还没有公开的技能'}</h2><p>有经过实践、适合分享的 Agent 技能后，会在这里发布说明和源码链接。</p></div></section>}</div>
    <a className="lab-link lab-archive-link" href="/explore">阅读旧站的学习资料 <ArrowRight size={16} /></a>
  </main>;
}

const oldGuides = {
  '/explore': ExploreCenter,
  '/explore/commercial-architecture': ArchitectureGuide,
  '/explore/chatgpt-codex-workflow': ChatGPTCodexGuide,
  '/explore/mcp-skills-plugins': ExtensionSystemGuide,
};

export default function LabApp() {
  const rawPath = location.pathname.replace(/\/+$/, '') || '/';
  const path = rawPath === '/repositories' ? '/skills' : rawPath;
  const privatePage = path === '/workbench';
  const project = path.startsWith('/projects/') ? projects.find(({ id }) => path === `/projects/${id}`) : null;
  const OldGuide = oldGuides[path];
  const title = privatePage ? '个人工作台' : project?.name ?? sections.find((section) => section.path === path)?.label ?? (OldGuide ? '学习资料' : '页面未找到');
  useEffect(() => { document.title = `${title} · LULU LAB`; }, [title]);
  let content;
  if (privatePage) content = <Workbench />;
  else if (path === '/') content = <Home />;
  else if (path === '/projects') content = <Projects />;
  else if (project) content = <ProjectDetail project={project} />;
  else if (path === '/games') content = <Games />;
  else if (path === '/skills') content = <Skills />;
  else if (path === '/aihot') content = <NewsPage />;
  else if (path === '/about') content = <LabAbout />;
  else if (OldGuide) content = <OldGuide />;
  else content = <main id="main-content" className="lab-page"><PageHeading number="404" eyebrow="NOT FOUND" title="页面未找到">这个地址没有对应的内容。</PageHeading><a className="lab-button" href="/">返回首页 <ArrowRight size={16} /></a></main>;
  return <div className={`lab-shell${path === '/' ? ' is-home' : ''}`}>
    <LabOrbit /><CursorTrail /><LabStack header={<Topbar path={path} />} enabled={!privatePage} home={path === '/'}>{content}</LabStack>
  </div>;
}
