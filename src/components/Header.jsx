import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const navItems = [
  { label: "个人主页", href: "#home" },
  { label: "个人终端", href: "#archive" },
  { label: "个人历程", href: "#journey" },
];

const getNavigationTarget = (href) => {
  if (href === "#archive") {
    return document.querySelector("#archive .archive-window")
      ?? document.querySelector("#archive");
  }

  return document.querySelector(href);
};

const getLayoutTop = (element) => {
  let top = 0;
  let current = element;
  while (current) {
    top += current.offsetTop;
    current = current.offsetParent;
  }
  return top;
};

const getDocumentBottomTop = () => {
  const scrollingElement = document.scrollingElement ?? document.documentElement;
  return Math.max(0, scrollingElement.scrollHeight - window.innerHeight);
};

const getArchiveViewportOffset = () => Math.min(128, Math.max(76, window.innerHeight * 0.1));

const getSectionInView = () => {
  const sections = navItems
    .map(({ href }) => document.querySelector(href))
    .filter(Boolean);
  if (!sections.length) return null;

  const scrollingElement = document.scrollingElement ?? document.documentElement;
  const maximumScroll = Math.max(0, scrollingElement.scrollHeight - window.innerHeight);
  if (maximumScroll - window.scrollY < 8) return "journey";

  const anchorY = window.innerHeight * 0.45;
  const containingSection = sections.find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= anchorY && rect.bottom >= anchorY;
  });
  if (containingSection) return containingSection.id;

  return sections
    .map((section) => {
      const rect = section.getBoundingClientRect();
      return {
        id: section.id,
        distance: Math.abs(rect.top - anchorY),
      };
    })
    .sort((a, b) => a.distance - b.distance)[0]?.id ?? null;
};

const Header = () => {
  const [activeSection, setActiveSection] = useState("home");

  const navigateToSection = (event, href) => {
    event.preventDefault();
    const target = getNavigationTarget(href);
    if (!target) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetTop = href === "#journey"
      ? getDocumentBottomTop()
      : href === "#archive"
        ? getLayoutTop(target)
        : window.scrollY + target.getBoundingClientRect().top;
    const chapterOffset = href === "#archive"
      ? getArchiveViewportOffset()
      : 0;
    window.history.pushState(null, "", href);
    setActiveSection(href.slice(1));
    window.scrollTo({
      top: Math.max(0, targetTop - chapterOffset),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  useEffect(() => {
    let frame = 0;
    let lastSection = window.location.hash.replace("#", "") || "home";

    const syncSection = () => {
      frame = 0;
      const sectionId = getSectionInView();
      if (!sectionId || sectionId === lastSection) return;

      lastSection = sectionId;
      setActiveSection(sectionId);
      const nextHash = `#${sectionId}`;
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, "", nextHash);
      }
    };

    const requestSync = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(syncSection);
    };

    requestSync();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, []);

  return (
    <motion.header
      className="floating-nav"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <a
        className="nav-brand"
        href="#home"
        aria-label="返回主页"
        onClick={(event) => navigateToSection(event, "#home")}
      >
        <span>Lulu</span>
      </a>
      <nav aria-label="页面导航">
        {navItems.map((item) => (
          <a
            key={item.href}
            className={activeSection === item.href.slice(1) ? "is-active" : ""}
            href={item.href}
            onClick={(event) => navigateToSection(event, item.href)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </motion.header>
  );
};

export default Header;
