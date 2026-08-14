import { ArrowRight, BookOpen, Clock3, Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { exploreLibrary } from "../data/exploreLibrary";

const ExploreCenter = ({ onNavigate }) => {
  const openPage = (event, path) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(path);
  };

  return (
    <main id="main-content" className="explore-page explore-index-page">
      <section className="explore-hero">
        <motion.div
          className="explore-hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="explore-kicker"><Sparkles size={15} /> LULU / LEARNING ATLAS</div>
          <div className="explore-title-line">
            <h1>探索中心</h1>
            <p>把想弄懂的事，做成随时可以翻阅和带走的知识卡片。</p>
          </div>
        </motion.div>
      </section>

      <section className="explore-library" aria-labelledby="library-title">
        <div className="library-heading">
          <div>
            <span>KNOWLEDGE CARDS</span>
            <h2 id="library-title">当前资料</h2>
          </div>
          <p><BookOpen size={15} /> 每张卡片，都有一份可带走的 AI 提示词</p>
        </div>

        <div className="explore-card-grid">
          {exploreLibrary.map((item, index) => (
            <motion.a
              key={item.slug}
              className={`explore-resource-card is-resource is-${item.accent}`}
              href={item.path}
              onClick={(event) => openPage(event, item.path)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 + index * 0.08, duration: 0.6 }}
              whileHover={{ y: -8, rotate: -0.35 }}
            >
              <div className="resource-card-topline">
                <span>{item.index}</span>
                <span>{item.eyebrow}</span>
              </div>
              <div className="resource-card-copy">
                <div className="resource-tags">
                  {item.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                </div>
                <h3>{item.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h3>
                <p>{item.summary}</p>
                <div className="resource-content-outline" aria-label="资料包含内容">
                  {item.contents.map((content) => <span key={content}>{content}</span>)}
                </div>
                <div className="resource-card-footer">
                  <span><Clock3 size={14} /> {item.duration}</span>
                  <span>{item.level}</span>
                  <i><ArrowRight size={18} /></i>
                </div>
              </div>
            </motion.a>
          ))}

          <div className="explore-resource-card is-coming" aria-label="更多学习卡片即将加入">
            <div className="coming-plus"><Plus size={28} /></div>
            <span>NEXT CURIOSITY</span>
            <h3>这里会继续长出<br />新的知识卡片</h3>
            <p>下一次遇到不懂的东西，就把它种在这里。</p>
          </div>
        </div>
      </section>

      <footer className="explore-footer">
        <span>LULU&apos;S LEARNING ATLAS</span>
        <p>保持好奇，慢慢建立自己的知识地图。</p>
        <span>UPDATED · 2026</span>
      </footer>
    </main>
  );
};

export default ExploreCenter;
