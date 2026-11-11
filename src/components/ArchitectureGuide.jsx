import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  Cloud,
  Code2,
  Copy,
  Database,
  GitBranch,
  Globe2,
  Layers3,
  Lightbulb,
  LockKeyhole,
  Play,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const architectureLayers = [
  {
    key: "experience",
    number: "04",
    label: "体验层",
    en: "EXPERIENCE",
    metaphor: "漂亮的门厅",
    description: "用户真正看见和操作的地方。它负责把信息讲清楚，但不应该偷偷决定重要的业务规则。",
    tech: "Web / App · React · Design System",
    icon: Globe2,
  },
  {
    key: "gateway",
    number: "03",
    label: "接入层",
    en: "GATEWAY",
    metaphor: "可靠的前台",
    description: "所有请求先在这里验明身份、限流和分发，避免陌生人直接跑进仓库或财务室。",
    tech: "CDN · Nginx · API Gateway · Auth",
    icon: ShieldCheck,
  },
  {
    key: "business",
    number: "02",
    label: "业务层",
    en: "BUSINESS",
    metaphor: "真正办事的部门",
    description: "订单、用户、支付等规则待在各自边界里；先用模块化单体做清楚，需要时再拆服务。",
    tech: "Domain Modules · Services · Jobs",
    icon: Layers3,
  },
  {
    key: "data",
    number: "01",
    label: "数据层",
    en: "DATA",
    metaphor: "有账本的仓库",
    description: "可靠保存事实，缓存热点，管理文件；数据只能通过明确的仓库接口被业务层使用。",
    tech: "PostgreSQL · Redis · Object Storage",
    icon: Database,
  },
];

const requestJourney = [
  { title: "用户点击", note: "我想提交订单", icon: Users },
  { title: "前台验票", note: "身份与参数检查", icon: ShieldCheck },
  { title: "业务办理", note: "执行订单规则", icon: Server },
  { title: "仓库记账", note: "事务化保存数据", icon: Database },
  { title: "结果返回", note: "页面得到成功状态", icon: CircleCheck },
];

const projectPillars = [
  { icon: GitBranch, title: "可协作", text: "代码有边界、分支有规则、变更必须评审。", label: "GIT + REVIEW" },
  { icon: ShieldCheck, title: "可测试", text: "关键逻辑有自动化测试，发布前能证明它没坏。", label: "TEST PYRAMID" },
  { icon: Cloud, title: "可部署", text: "同一份构建产物，自动进入测试、预发与生产。", label: "CI / CD" },
  { icon: LockKeyhole, title: "可防护", text: "权限最小化、密钥不进代码、依赖持续扫描。", label: "SECURITY" },
  { icon: Server, title: "可观察", text: "日志、指标和链路能回答：哪里坏了，影响谁。", label: "OBSERVABILITY" },
  { icon: BookOpen, title: "可接手", text: "新人只看 README 与决策记录，也能启动和理解项目。", label: "DOCUMENTATION" },
];

const recommendedSkills = [
  {
    name: "superpowers:brainstorming",
    purpose: "在动手前厘清需求、边界与取舍，适合先设计架构。",
    url: "https://github.com/obra/superpowers",
  },
  {
    name: "superpowers:writing-plans",
    purpose: "把架构拆成可执行的小步骤，避免一上来就堆代码。",
    url: "https://github.com/obra/superpowers",
  },
  {
    name: "superpowers:test-driven-development",
    purpose: "让关键业务规则从一开始就有测试保护。",
    url: "https://github.com/obra/superpowers",
  },
  {
    name: "superpowers:requesting-code-review",
    purpose: "在提交前检查实现是否偏离目标与工程标准。",
    url: "https://github.com/obra/superpowers",
  },
];

const aiPrompt = "请以可上线、可维护的商用项目标准实现：采用前后端分离与模块化单体架构，按体验层、接入层、业务层、数据层划分清晰边界，业务按领域模块组织并通过接口解耦，统一鉴权、参数校验、错误处理和日志，使用 PostgreSQL、Redis 与对象存储，补齐单元/集成/E2E 测试、环境配置、数据库迁移、Docker、CI/CD、监控告警、安全基线、README 和架构决策记录，并优先保持简单，只有在真实的独立扩缩容需求出现时才拆分微服务。";

const ArchitectureGuide = ({ onNavigate }) => {
  const [selectedLayer, setSelectedLayer] = useState("business");
  const [journeyStep, setJourneyStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(0);

  const activeLayer = architectureLayers.find((layer) => layer.key === selectedLayer) ?? architectureLayers[2];

  useEffect(() => {
    if (!isPlaying) return undefined;
    setJourneyStep(0);
    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      if (current >= requestJourney.length) {
        window.clearInterval(timer);
        setIsPlaying(false);
        return;
      }
      setJourneyStep(current);
    }, 850);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => () => window.clearTimeout(copyTimerRef.current), []);

  const goBack = (event) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate("/explore");
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = aiPrompt;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <main id="main-content" className="explore-page architecture-page">
      <div className="architecture-reading-progress" aria-hidden="true" />

      <section className="architecture-hero">
        <motion.div
          className="architecture-hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <a className="explore-back-link" href="/share" onClick={goBack}>
            <ArrowLeft size={16} /> 返回分享
          </a>
          <div className="architecture-index"><span>EXP.001</span><i /> PROJECT SYSTEMS</div>
          <h1>商用项目架构：<em>从能跑到能长期运营</em></h1>
          <p>别把它想成一堆神秘的文件夹。它更像一栋长期营业的建筑：好看只是门面，真正重要的是每层各司其职，停电、下雨、换人以后依然能开门。</p>
          <div className="hero-summary-strip">
            <Lightbulb size={19} />
            <div><span>一句话先懂</span><strong>商用架构不是“技术越多越专业”，而是让项目能被多人安全地持续修改、发布和维护。</strong></div>
          </div>
        </motion.div>

        <motion.div
          className="architecture-hero-model"
          initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          <div className="model-grid" />
          <span className="model-label model-label-a">LONG-TERM<br />OPERABLE</span>
          <span className="model-label model-label-b">CLICK A FLOOR<br />TO INSPECT</span>
          <div className="model-building">
            <span className="model-antenna" />
            <div className="model-roof">PRODUCTION<br /><b>READY</b></div>
            {architectureLayers.map((layer) => (
              <div key={layer.key} className={`model-floor floor-${layer.key}`}>
                <span>{layer.number}</span><b>{layer.label}</b><i>{layer.en}</i>
              </div>
            ))}
            <div className="model-base">TEST · DEPLOY · MONITOR · SECURE</div>
          </div>
          <span className="model-person">●<i /></span>
          <span className="model-tree"><i /><i /><b /></span>
        </motion.div>
      </section>

      <section className="architecture-section layer-lab">
        <div className="architecture-section-heading">
          <span className="section-count">01</span>
          <div><span>THE BUILDING</span><h2>先参观这栋“四层小楼”</h2></div>
          <p>点任意楼层，看看它负责什么、不该负责什么。</p>
        </div>

        <div className="layer-lab-layout">
          <div className="interactive-building" role="list" aria-label="项目架构层级">
            <div className="building-rooftop"><Sparkles size={16} /> 用户价值</div>
            {architectureLayers.map((layer) => {
              const Icon = layer.icon;
              return (
                <button
                  type="button"
                  role="listitem"
                  key={layer.key}
                  className={`building-layer is-${layer.key} ${selectedLayer === layer.key ? "is-selected" : ""}`}
                  onClick={() => setSelectedLayer(layer.key)}
                  aria-pressed={selectedLayer === layer.key}
                >
                  <span>{layer.number}</span>
                  <Icon size={21} />
                  <strong>{layer.label}</strong>
                  <small>{layer.en}</small>
                  <ArrowRight size={17} />
                </button>
              );
            })}
            <div className="building-foundation">工程底座 · 让每一层都能放心变化</div>
          </div>

          <motion.article
            key={activeLayer.key}
            className={`layer-inspector is-${activeLayer.key}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="inspector-tape">INSPECTING / {activeLayer.number}</div>
            <span className="inspector-metaphor">把它想成：{activeLayer.metaphor}</span>
            <h3>{activeLayer.label}<em>{activeLayer.en}</em></h3>
            <p>{activeLayer.description}</p>
            <div className="inspector-tech"><Code2 size={17} /><span>{activeLayer.tech}</span></div>
            <div className="inspector-rule">
              <strong>边界口诀</strong>
              <span>{activeLayer.key === "experience" && "只负责展示与交互，不把核心业务规则散落在页面里。"}</span>
              <span>{activeLayer.key === "gateway" && "所有外部流量从同一个受控入口进入。"}</span>
              <span>{activeLayer.key === "business" && "规则属于领域模块，模块之间只通过公开接口说话。"}</span>
              <span>{activeLayer.key === "data" && "业务不直接到处写 SQL，数据访问集中管理。"}</span>
            </div>
          </motion.article>
        </div>
      </section>

      <section className="architecture-section request-tour">
        <div className="architecture-section-heading">
          <span className="section-count">02</span>
          <div><span>ONE REQUEST TOUR</span><h2>一次点击，怎样穿过整栋楼？</h2></div>
          <button type="button" className="play-journey" onClick={() => setIsPlaying(true)} disabled={isPlaying}>
            <Play size={15} fill="currentColor" /> {isPlaying ? "正在旅行…" : "播放请求旅程"}
          </button>
        </div>

        <div className="request-track">
          <div className="request-track-line" aria-hidden="true">
            <i style={{ "--journey-progress": journeyStep < 0 ? 0 : journeyStep / (requestJourney.length - 1) }} />
          </div>
          {requestJourney.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                type="button"
                key={step.title}
                className={`request-stop ${journeyStep >= index ? "is-passed" : ""} ${journeyStep === index ? "is-current" : ""}`}
                onClick={() => { setIsPlaying(false); setJourneyStep(index); }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <i><Icon size={21} /></i>
                <strong>{step.title}</strong>
                <small>{step.note}</small>
              </button>
            );
          })}
        </div>
        <p className="request-tour-note">每一步都留下可追踪的日志；任一步失败，都返回统一的错误格式，而不是让用户面对一片空白。</p>
      </section>

      <section className="architecture-section production-standard">
        <div className="architecture-section-heading">
          <span className="section-count">03</span>
          <div><span>NOT JUST CODE</span><h2>“正式”二字，藏在这六件事里</h2></div>
          <p>页面能跑只是起点，能长期营业才是商用项目。</p>
        </div>

        <div className="pillar-grid">
          {projectPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.article
                key={pillar.title}
                className="pillar-card"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.05 }}
              >
                <div><Icon size={22} /><span>{String(index + 1).padStart(2, "0")}</span></div>
                <small>{pillar.label}</small>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="architecture-section folder-map-section">
        <div className="architecture-section-heading">
          <span className="section-count">04</span>
          <div><span>REAL PROJECT MAP</span><h2>落到代码里，大概是这张地图</h2></div>
          <p>重点不是文件夹名字，而是让职责与依赖方向一眼可见。</p>
        </div>

        <div className="folder-map-card">
          <div className="folder-window-bar"><i /><i /><i /><span>commerce-platform / structure</span></div>
          <div className="folder-map-tree" aria-label="推荐项目目录结构">
            <code><b>apps/</b><span>可独立运行的入口</span></code>
            <code className="is-child"><b>web/</b><span>用户界面</span></code>
            <code className="is-child"><b>api/</b><span>后端应用与接入层</span></code>
            <code><b>modules/</b><span>真正的业务核心</span></code>
            <code className="is-child"><b>users/</b><span>用户领域</span></code>
            <code className="is-child"><b>orders/</b><span>订单领域</span></code>
            <code className="is-child"><b>payments/</b><span>支付领域</span></code>
            <code><b>packages/</b><span>共享但不含业务的能力</span></code>
            <code className="is-child"><b>ui · config · observability</b><span>组件、配置、监控</span></code>
            <code><b>infra/</b><span>部署、容器与云资源</span></code>
            <code><b>docs/</b><span>README 与架构决策记录</span></code>
          </div>
          <aside className="dependency-compass">
            <span>DEPENDENCY RULE</span>
            <div className="compass-rings"><i>外部工具</i><i>应用服务</i><i>领域规则</i><b>核心</b></div>
            <p><strong>依赖只能向内。</strong>核心业务不应该知道你用了哪家数据库或云服务。</p>
          </aside>
        </div>
      </section>

      <section className="architecture-section ai-takeaway">
        <div className="takeaway-stamp"><Sparkles size={17} /> TAKE IT TO YOUR AI</div>
        <div className="takeaway-heading">
          <span>05 / 最后，把整张图收进一句话</span>
          <h2>复制给 AI，就从一个靠谱的地基开始。</h2>
          <p>这不是让 AI 无脑堆技术，而是先明确质量目标、边界与交付物。</p>
        </div>

        <div className="prompt-card">
          <div className="prompt-card-label"><span>ONE-SENTENCE PROMPT</span><i>可直接复制</i></div>
          <blockquote>{aiPrompt}</blockquote>
          <button type="button" className={copied ? "is-copied" : ""} onClick={copyPrompt}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "已复制，可以去开工了" : "复制这句提示词"}
          </button>
        </div>

        <div className="skill-recommendation">
          <div className="skill-recommendation-heading">
            <span>RECOMMENDED SKILLS</span>
            <strong>从想清楚到交付，配合使用这四个 Skill</strong>
            <p>均来自 <a href="https://github.com/obra/superpowers" target="_blank" rel="noreferrer">obra/superpowers</a>：一个被广泛使用的开源 Agent 工作流仓库。</p>
          </div>
          <div className="skill-list">
            {recommendedSkills.map((skill, index) => (
              <a key={skill.name} href={skill.url} target="_blank" rel="noreferrer" className="skill-item">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{skill.name}</strong><p>{skill.purpose}</p></div>
                <ArrowRight size={15} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="architecture-footer">
        <a href="/share" onClick={goBack}><ArrowLeft size={16} /> 返回分享</a>
        <div><span>EXP.001 COMPLETE</span><strong>你已经看懂一栋可以长期营业的软件建筑。</strong></div>
        <a href="#main-content">回到顶部 <ArrowRight size={16} /></a>
      </footer>
    </main>
  );
};

export default ArchitectureGuide;
