import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ArchiveExplorer from "./components/ArchiveExplorer";
import Footer from "./components/Footer";
import AmbientBackground from "./components/AmbientBackground";
import EntryLoader from "./components/EntryLoader";
import CursorTrail from "./components/CursorTrail";
import ScrollDecorations from "./components/ScrollDecorations";
import ExploreCenter from "./components/ExploreCenter";
import ArchitectureGuide from "./components/ArchitectureGuide";
import { ChatGPTCodexGuide, ExtensionSystemGuide } from "./components/KnowledgeGuides";
import "./App.css";
import "./Explore.css";
import "./Guide.css";

const getArchiveViewportOffset = () => Math.min(128, Math.max(76, window.innerHeight * 0.1));

function App() {
  const [badgeFlipped, setBadgeFlipped] = useState(false);
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname.replace(/\/+$/, "") || "/",
    hash: window.location.hash,
  }));
  const rainDrops = useMemo(
    () => Array.from({ length: 16 }, (_, index) => ({
      id: index,
      left: `${5 + ((index * 37) % 92)}%`,
      delay: `${(index % 6) * -1.05 - Math.floor(index / 6) * 0.33}s`,
      duration: `${4.7 + (index % 5) * 0.48}s`,
      length: `${18 + (index % 4) * 7}px`,
      opacity: 0.34 + (index % 3) * 0.13,
    })),
    [],
  );

  const navigate = (target) => {
    const next = new URL(target, window.location.origin);
    window.history.pushState(null, "", `${next.pathname}${next.hash}`);
    setLocation({
      pathname: next.pathname.replace(/\/+$/, "") || "/",
      hash: next.hash,
    });
  };

  useEffect(() => {
    const handlePopState = () => setLocation({
      pathname: window.location.pathname.replace(/\/+$/, "") || "/",
      hash: window.location.hash,
    });
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const titles = {
      "/": "Lulu 个人空间",
      "/explore": "探索中心 · Lulu",
      "/explore/commercial-architecture": "商用项目架构指南 · 探索中心",
      "/explore/chatgpt-codex-workflow": "ChatGPT 与 Codex 高效工作流 · 探索中心",
      "/explore/mcp-skills-plugins": "MCP、Skill 与插件指南 · 探索中心",
    };
    document.title = titles[location.pathname] ?? "探索中心 · Lulu";

    if (location.pathname !== "/") {
      window.scrollTo({ top: 0, behavior: "auto" });
      return undefined;
    }
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return undefined;
    }
    const timer = window.setTimeout(() => {
      const hash = location.hash;
      const target = hash === "#archive"
        ? document.querySelector("#archive .archive-window") ?? document.querySelector("#archive")
        : document.querySelector(hash);
      if (!target) return;
      let targetTop = hash === "#journey"
        ? Math.max(0, (document.scrollingElement ?? document.documentElement).scrollHeight - window.innerHeight)
        : window.scrollY + target.getBoundingClientRect().top;
      if (hash === "#archive") {
        targetTop = 0;
        let current = target;
        while (current) {
          targetTop += current.offsetTop;
          current = current.offsetParent;
        }
      }
      const chapterOffset = hash === "#archive"
        ? getArchiveViewportOffset()
        : 0;
      window.scrollTo({ top: Math.max(0, targetTop - chapterOffset) });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location]);

  const renderPage = () => {
    if (location.pathname === "/explore/chatgpt-codex-workflow") {
      return <ChatGPTCodexGuide onNavigate={navigate} />;
    }
    if (location.pathname === "/explore/mcp-skills-plugins") {
      return <ExtensionSystemGuide onNavigate={navigate} />;
    }
    if (location.pathname === "/explore/commercial-architecture") {
      return <ArchitectureGuide onNavigate={navigate} />;
    }
    if (location.pathname === "/explore") {
      return <ExploreCenter onNavigate={navigate} />;
    }

    return (
      <>
        <motion.main
          id="main-content"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Hero badgeFlipped={badgeFlipped} onBadgeFlipChange={setBadgeFlipped} />
          <ArchiveExplorer />
        </motion.main>
        <Footer />
      </>
    );
  };

  return (
    <div className={`app-shell ${badgeFlipped ? "is-rainy" : ""}`}>
      {location.pathname === "/" && <EntryLoader />}
      <AmbientBackground />
      <div className={`rain-overlay ${badgeFlipped ? "is-active" : ""}`} aria-hidden="true">
        {rainDrops.map((drop) => (
          <i
            key={drop.id}
            className="rain-drop"
            style={{
              "--rain-left": drop.left,
              "--rain-delay": drop.delay,
              "--rain-duration": drop.duration,
              "--rain-length": drop.length,
              "--rain-opacity": drop.opacity,
            }}
          />
        ))}
      </div>
      {location.pathname === "/" && <ScrollDecorations rainy={badgeFlipped} />}
      <CursorTrail />
      <Header currentPath={location.pathname} onNavigate={navigate} />

      {renderPage()}

    </div>
  );
}

export default App;
