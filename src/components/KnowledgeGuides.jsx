import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BrainCircuit,
  CalendarClock,
  Check,
  Code2,
  Copy,
  FileCheck2,
  FolderKanban,
  GitBranch,
  Layers3,
  Lightbulb,
  Link2,
  MessageCircle,
  Package,
  Repeat2,
  Search,
  ShieldCheck,
  Terminal,
  Wrench,
  Zap,
} from "lucide-react";

const officialSources = {
  desktop: [
    { label: "桌面应用", url: "https://learn.chatgpt.com/docs/app" },
    { label: "项目与聊天", url: "https://learn.chatgpt.com/docs/projects" },
    { label: "长任务 / Goal", url: "https://learn.chatgpt.com/docs/long-running-work" },
    { label: "Scheduled", url: "https://learn.chatgpt.com/docs/automations" },
    { label: "Worktrees", url: "https://learn.chatgpt.com/docs/environments/git-worktrees" },
    { label: "Subagents", url: "https://learn.chatgpt.com/docs/agent-configuration/subagents" },
  ],
  extensions: [
    { label: "Skills & Plugins", url: "https://learn.chatgpt.com/docs/skills-and-plugins" },
    { label: "MCP", url: "https://learn.chatgpt.com/docs/extend/mcp?surface=cli" },
    { label: "Build Skills", url: "https://learn.chatgpt.com/docs/build-skills" },
    { label: "Plugins", url: "https://learn.chatgpt.com/docs/plugins" },
  ],
};

const GuideHeader = ({ index, eyebrow, title, summary, takeaway, onNavigate }) => {
  const goBack = (event) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate("/explore");
  };

  return (
    <header className="guide-header">
      <a className="guide-back" href="/share" onClick={goBack}><ArrowLeft size={15} /> 返回分享</a>
      <div className="guide-meta"><span>{index}</span><i />{eyebrow}</div>
      <div className="guide-header-layout">
        <div>
          <h1>{title}</h1>
          <p>{summary}</p>
        </div>
        <aside><Lightbulb size={18} /><div><span>一句话先懂</span><strong>{takeaway}</strong></div></aside>
      </div>
    </header>
  );
};

const GuideSectionHeading = ({ index, eyebrow, title, note }) => (
  <div className="guide-section-heading">
    <span>{index}</span>
    <div><small>{eyebrow}</small><h2>{title}</h2></div>
    {note && <p>{note}</p>}
  </div>
);

const CopyPrompt = ({ title, prompt }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const field = document.createElement("textarea");
      field.value = prompt;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="guide-prompt-card">
      <div><span>ONE-SENTENCE PROMPT</span><strong>{title}</strong></div>
      <blockquote>{prompt}</blockquote>
      <button type="button" onClick={copy} className={copied ? "is-copied" : ""}>
        {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "已复制" : "复制提示词"}
      </button>
    </div>
  );
};

const SourceLinks = ({ sources }) => (
  <div className="guide-sources">
    <span>OPENAI OFFICIAL SOURCES</span>
    <div>{sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ArrowRight size={13} /></a>)}</div>
  </div>
);

const GuideFooter = ({ onNavigate, complete }) => {
  const goBack = (event) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate("/explore");
  };

  return (
    <footer className="knowledge-guide-footer">
      <a href="/share" onClick={goBack}><ArrowLeft size={15} /> 返回分享</a>
      <span>{complete}</span>
      <a href="#main-content">回到顶部 <ArrowRight size={15} /></a>
    </footer>
  );
};

const desktopWorkflow = [
  { icon: FolderKanban, title: "建项目", text: "长期任务放进 Project；关联文件夹、资料和说明。", tool: "PROJECT" },
  { icon: Search, title: "先研究", text: "用 Chat 澄清目标，用 Work 汇总资料并形成可审阅方案。", tool: "CHAT / WORK" },
  { icon: Lightbulb, title: "再定计划", text: "目标不清时先 /plan，把约束和验收标准谈明白。", tool: "/PLAN" },
  { icon: Bot, title: "交给 Codex", text: "明确结果、修改范围、禁止事项和完成条件，再开始实现。", tool: "CODEX / GOAL" },
  { icon: GitBranch, title: "安全并行", text: "独立任务用新聊天、Subagent 或 Worktree，避免同时写同一处。", tool: "PARALLEL" },
  { icon: FileCheck2, title: "验收沉淀", text: "要求运行检查、展示差异；重复流程再升级成 Skill 或 Scheduled。", tool: "VERIFY" },
];

const surfaceChoices = [
  { icon: MessageCircle, name: "Chat", best: "探索、讨论、快速问答", avoid: "不要把多周项目塞在一条无结构闲聊里。" },
  { icon: FolderKanban, name: "Project", best: "共享文件、说明与多条相关聊天", avoid: "不要为一次性小问题创建项目。" },
  { icon: Layers3, name: "Work", best: "研究、文档、表格、演示等成品", avoid: "不要让它直接替代代码仓库里的工程验证。" },
  { icon: Terminal, name: "Codex", best: "读写代码、运行命令、修复与测试", avoid: "不要只说“帮我优化”，要给范围和验收标准。" },
  { icon: GitBranch, name: "Worktree", best: "同一仓库中的独立并行开发", avoid: "有强依赖或改同一文件的任务不要并行。" },
  { icon: CalendarClock, name: "Scheduled", best: "周期检查、整理、提醒和后台任务", avoid: "依赖本地文件时要保持电脑和应用运行。" },
];

const desktopPrompt = "请先查看当前项目文件与说明，向我确认目标、约束和验收标准；然后给出最小可行计划并在我确认后实施，过程中把可独立的研究或验证任务并行处理，但避免多个任务同时修改同一文件，完成后运行相关检查、总结实际改动与未解决风险，并提供我可以直接验证结果的步骤。";

const ChatGPTCodexGuide = ({ onNavigate }) => (
  <main id="main-content" className="knowledge-guide desktop-workflow-guide">
    <GuideHeader
      index="EXP.002"
      eyebrow="DESKTOP WORKFLOW"
      title="用好 ChatGPT + Codex：从想法到交付"
      summary="高效的关键不是把所有任务都交给同一个对话，而是让不同模式负责自己最擅长的一段。"
      takeaway="ChatGPT 负责想清楚、组织上下文与产出资料；Codex 负责在真实项目里修改、运行、验证和交付。"
      onNavigate={onNavigate}
    />

    <section className="guide-section mode-handshake">
      <GuideSectionHeading index="01" eyebrow="TWO MODES" title="先把两个模式放在正确的位置" note="它们不是竞争关系，而是一条工作链上的前后手。" />
      <div className="mode-handshake-board">
        <article className="mode-card is-chat">
          <div><BrainCircuit size={24} /><span>CHATGPT</span></div>
          <h3>理解与组织</h3>
          <p>讨论方向、查资料、比较方案、整理文件、制作可审阅的成果。</p>
          <ul><li>需求澄清</li><li>研究与总结</li><li>项目上下文</li></ul>
        </article>
        <div className="mode-bridge" aria-label="从 ChatGPT 到 Codex 的协作流程">
          <span>清晰目标</span><ArrowRight size={22} /><span>可验收结果</span>
        </div>
        <article className="mode-card is-codex">
          <div><Code2 size={24} /><span>CODEX</span></div>
          <h3>行动与验证</h3>
          <p>理解代码库、修改文件、运行命令、测试行为、审查差异并准备交付。</p>
          <ul><li>实现与修复</li><li>测试与浏览器验证</li><li>代码审查</li></ul>
        </article>
      </div>
    </section>

    <section className="guide-section workflow-section">
      <GuideSectionHeading index="02" eyebrow="PROJECT LOOP" title="一条更稳的项目流水线" note="先给上下文，再给目标；先验收，再复用。" />
      <div className="workflow-rail">
        {desktopWorkflow.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.article key={step.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
              <span>{String(index + 1).padStart(2, "0")}</span><i><Icon size={20} /></i><small>{step.tool}</small><h3>{step.title}</h3><p>{step.text}</p>
            </motion.article>
          );
        })}
      </div>
    </section>

    <section className="guide-section surface-map-section">
      <GuideSectionHeading index="03" eyebrow="CHOOSE THE SURFACE" title="看到任务，先选对容器" note="选错模式通常比提示词写得不够漂亮更浪费时间。" />
      <div className="surface-map">
        {surfaceChoices.map((choice) => {
          const Icon = choice.icon;
          return <article key={choice.name}><Icon size={20} /><h3>{choice.name}</h3><strong>{choice.best}</strong><p>{choice.avoid}</p></article>;
        })}
      </div>
    </section>

    <section className="guide-section efficiency-rules">
      <GuideSectionHeading index="04" eyebrow="HIGH-LEVERAGE HABITS" title="真正拉开效率的五个习惯" />
      <div className="habit-board">
        <div className="habit-primary"><Zap size={22} /><span>最高杠杆</span><h3>每次都写“完成意味着什么”</h3><p>让 Agent 知道什么时候该继续、什么时候该停，以及最后要拿什么证据回来。</p></div>
        <ol>
          <li><span>01</span><div><strong>上下文留在 Project</strong><p>持续任务不要每次重新解释背景。</p></div></li>
          <li><span>02</span><div><strong>独立任务才并行</strong><p>研究、测试、不同模块适合并行；同一文件不适合。</p></div></li>
          <li><span>03</span><div><strong>让结果可以检查</strong><p>要求测试结果、截图、差异或可复现步骤。</p></div></li>
          <li><span>04</span><div><strong>重复三次就沉淀</strong><p>稳定流程做成 Skill，周期任务做成 Scheduled。</p></div></li>
          <li><span>05</span><div><strong>复杂目标用 /goal</strong><p>先明确终点与约束，让长任务持续向结果推进。</p></div></li>
        </ol>
      </div>
    </section>

    <section className="guide-section guide-takeaway">
      <GuideSectionHeading index="05" eyebrow="TAKE IT WITH YOU" title="把高效协作写进一句提示词" />
      <CopyPrompt title="适合开始一个真实项目任务" prompt={desktopPrompt} />
      <SourceLinks sources={officialSources.desktop} />
    </section>
    <GuideFooter onNavigate={onNavigate} complete="EXP.002 · WORKFLOW READY" />
  </main>
);

const extensionConcepts = [
  { key: "mcp", icon: Link2, name: "MCP", metaphor: "给 AI 一双手", color: "mint", short: "连接外部工具与实时上下文", includes: "工具、资源、提示与认证", use: "需要读取 Figma、浏览器、数据库或企业系统时" },
  { key: "skill", icon: BrainCircuit, name: "Skill", metaphor: "教 AI 一套做事方法", color: "amber", short: "把稳定流程、标准和资源保存下来", includes: "SKILL.md、模板、示例、脚本", use: "同类任务会重复，且好结果依赖固定步骤时" },
  { key: "plugin", icon: Package, name: "插件", metaphor: "把方法和工具装进工具箱", color: "lilac", short: "安装、分发一组完整能力", includes: "Skills、MCP / Connectors、可选 UI", use: "希望一次安装、跨 ChatGPT 与 Codex 使用时" },
];

const decisionOptions = [
  { key: "repeat", label: "我总在重复同一套步骤", result: "skill", reason: "先把步骤、模板和质量标准做成 Skill。" },
  { key: "external", label: "AI 需要读取或操作外部系统", result: "mcp", reason: "用 MCP 提供受控的工具和上下文入口。" },
  { key: "share", label: "我要让别人一键安装整套能力", result: "plugin", reason: "用插件打包 Skill 与 MCP，再进行分发。" },
];

const extensionPrompt = "在开始任务前，请先判断当前需求是否需要外部工具或实时数据（需要则选 MCP）、是否依赖可重复的固定流程与模板（需要则选 Skill）、是否需要将多项能力打包安装或分享给他人（需要则选插件），只启用完成任务所必需的最小能力，并在使用外部工具前说明将读取或修改什么。";

const ExtensionSystemGuide = ({ onNavigate }) => {
  const [decision, setDecision] = useState("repeat");
  const activeDecision = decisionOptions.find((item) => item.key === decision) ?? decisionOptions[0];
  const activeConcept = extensionConcepts.find((item) => item.key === activeDecision.result) ?? extensionConcepts[1];
  const ActiveIcon = activeConcept.icon;

  return (
    <main id="main-content" className="knowledge-guide extension-system-guide">
      <GuideHeader
        index="EXP.003"
        eyebrow="EXTENSION SYSTEM"
        title="MCP、Skill、插件：AI 的手、方法与工具箱"
        summary="三者解决的问题完全不同。先判断你缺的是“连接能力”“稳定流程”，还是“可安装的整套方案”。"
        takeaway="MCP 负责连接，Skill 负责教方法，插件负责把它们打包并分发。"
        onNavigate={onNavigate}
      />

      <section className="guide-section concept-section">
        <GuideSectionHeading index="01" eyebrow="THREE ROLES" title="把三者放到一张工作台上" note="名称不重要，先记住它们各自解决的问题。" />
        <div className="concept-grid">
          {extensionConcepts.map((concept) => {
            const Icon = concept.icon;
            return (
              <article key={concept.key} className={`concept-card is-${concept.color}`}>
                <div><Icon size={24} /><span>{concept.name}</span></div><small>{concept.metaphor}</small><h3>{concept.short}</h3>
                <dl><div><dt>里面有什么</dt><dd>{concept.includes}</dd></div><div><dt>什么时候用</dt><dd>{concept.use}</dd></div></dl>
              </article>
            );
          })}
        </div>
      </section>

      <section className="guide-section decision-section">
        <GuideSectionHeading index="02" eyebrow="QUICK DECISION" title="回答一个问题，立刻知道该选谁" />
        <div className="decision-console">
          <div className="decision-questions">
            <span>你当前真正缺少什么？</span>
            {decisionOptions.map((option, index) => (
              <button type="button" key={option.key} className={decision === option.key ? "is-active" : ""} onClick={() => setDecision(option.key)}>
                <i>{String(index + 1).padStart(2, "0")}</i><strong>{option.label}</strong><ArrowRight size={16} />
              </button>
            ))}
          </div>
          <motion.div key={activeConcept.key} className={`decision-answer is-${activeConcept.color}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
            <span>RECOMMENDED</span><ActiveIcon size={34} /><h3>{activeConcept.name}</h3><p>{activeDecision.reason}</p><small>{activeConcept.metaphor}</small>
          </motion.div>
        </div>
      </section>

      <section className="guide-section composition-section">
        <GuideSectionHeading index="03" eyebrow="WORK TOGETHER" title="它们经常组合使用，不是三选一" note="一个成熟插件，可以同时带来做事方法和外部工具。" />
        <div className="plugin-box-visual">
          <div className="plugin-box-label"><Package size={19} /><span>PLUGIN · 可安装的能力包</span></div>
          <div className="plugin-box-content">
            <article><BrainCircuit size={22} /><div><span>SKILL</span><strong>先规定工作流程</strong><p>例如：读取设计规范 → 实现 → 浏览器检查 → 交付截图。</p></div></article>
            <span className="composition-plus">+</span>
            <article><Link2 size={22} /><div><span>MCP / CONNECTOR</span><strong>再连接真实工具</strong><p>例如：读取 Figma 节点、创建 issue、查询数据库。</p></div></article>
          </div>
          <div className="plugin-output"><ArrowRight size={17} /><strong>结果：</strong>安装一次，就同时获得“怎么做”和“用什么做”。</div>
        </div>
      </section>

      <section className="guide-section daily-use-section">
        <GuideSectionHeading index="04" eyebrow="DAILY RULES" title="日常使用，遵循这张小抄" />
        <div className="daily-rule-grid">
          <article><Repeat2 size={20} /><span>重复三次</span><h3>考虑做成 Skill</h3><p>先稳定人工流程，再固化；不要把尚未想清楚的习惯写进 Skill。</p></article>
          <article><Wrench size={20} /><span>缺少工具</span><h3>寻找或接入 MCP</h3><p>优先只开放任务所需能力，确认读取与写入范围。</p></article>
          <article><Package size={20} /><span>需要分发</span><h3>再升级为插件</h3><p>当 Skill 和连接器需要一起安装、共享和更新时再打包。</p></article>
          <article><ShieldCheck size={20} /><span>涉及外部数据</span><h3>先检查权限</h3><p>确认来源、写入范围、凭据与审批；不使用来路不明的扩展。</p></article>
        </div>
      </section>

      <section className="guide-section extension-table-section">
        <GuideSectionHeading index="05" eyebrow="ONE GLANCE" title="最后，用一张表记住" />
        <div className="extension-table" role="table" aria-label="MCP、Skill 与插件对照表">
          <div role="row"><strong role="columnheader">对比</strong><strong role="columnheader">MCP</strong><strong role="columnheader">Skill</strong><strong role="columnheader">插件</strong></div>
          <div role="row"><span>核心作用</span><p>连接工具与上下文</p><p>指导稳定流程</p><p>安装与分发能力</p></div>
          <div role="row"><span>是否可以独立使用</span><p>可以</p><p>可以</p><p>它本身是容器</p></div>
          <div role="row"><span>最常见例子</span><p>Figma / 数据库</p><p>文档生成 / 代码审查</p><p>GitHub / 安全工作台</p></div>
          <div role="row"><span>第一关注点</span><p>权限与数据边界</p><p>流程是否清晰可靠</p><p>来源、内容与安装范围</p></div>
        </div>
      </section>

      <section className="guide-section guide-takeaway">
        <GuideSectionHeading index="06" eyebrow="TAKE IT WITH YOU" title="让 AI 先替你判断该用哪种扩展" />
        <CopyPrompt title="适合在不确定工具选择时使用" prompt={extensionPrompt} />
        <SourceLinks sources={officialSources.extensions} />
      </section>
      <GuideFooter onNavigate={onNavigate} complete="EXP.003 · EXTENSIONS UNDERSTOOD" />
    </main>
  );
};

export { ChatGPTCodexGuide, ExtensionSystemGuide };
