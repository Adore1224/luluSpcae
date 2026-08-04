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
import MusicPlayer from "./components/MusicPlayer";
import "./App.css";

const getArchiveViewportOffset = () => Math.min(128, Math.max(76, window.innerHeight * 0.1));

function App() {
  const [badgeFlipped, setBadgeFlipped] = useState(false);
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

  useEffect(() => {
    if (!window.location.hash) return undefined;
    const timer = window.setTimeout(() => {
      const hash = window.location.hash;
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
  }, []);

  return (
    <div className={`app-shell ${badgeFlipped ? "is-rainy" : ""}`}>
      <EntryLoader />
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
      <ScrollDecorations rainy={badgeFlipped} />
      <CursorTrail />
      <MusicPlayer />
      <Header />

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

    </div>
  );
}

export default App;
