import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUp, Waves } from "lucide-react";
import paperBoatUrl from "../assets/life-road/paper-boat.png";
import boulderUrl from "../assets/life-road/watercolor-boulder.png";
import { lifeJourneyMilestones } from "../data/lifeJourney";

const journeyWaypoints = [
  { x: 10, y: 67, angle: -10, stoneX: 10, stoneY: 80, stoneAngle: 0 },
  { x: 30, y: 39, angle: -2, stoneX: 26, stoneY: 12, stoneAngle: 0 },
  { x: 46, y: 52, angle: 25, stoneX: 38, stoneY: 70, stoneAngle: 0 },
  { x: 60, y: 62, angle: -5, stoneX: 53, stoneY: 33, stoneAngle: 0 },
  { x: 70, y: 48, angle: -30, stoneX: 70, stoneY: 62, stoneAngle: 0 },
  { x: 96, y: 40, angle: 0, stoneX: 90, stoneY: 51, stoneAngle: 0 },
];

const streamPath = "M -50 380 C 70 430 120 360 160 335 C 250 280 300 170 390 225 C 480 280 540 390 640 330 C 720 280 760 155 840 205 C 915 245 960 180 1050 150";

const StreamArtwork = () => (
  <svg className="journey-stream-art" viewBox="0 0 1000 540" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="journey-water" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#28454d" />
        <stop offset="0.5" stopColor="#35616b" />
        <stop offset="1" stopColor="#1f3c46" />
      </linearGradient>
      <filter id="journey-water-soft" x="-20%" y="-40%" width="140%" height="180%">
        <feGaussianBlur stdDeviation="12" />
      </filter>
    </defs>
    <path className="journey-stream-shadow" d={streamPath} />
    <path className="journey-stream-bank" d={streamPath} />
    <path className="journey-stream-water" d={streamPath} />
    <path className="journey-stream-glow" d={streamPath} />
    <path className="journey-stream-current journey-stream-current-one" d={streamPath} />
  </svg>
);

const Footer = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const sectionActiveRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const currentMilestone = lifeJourneyMilestones[currentIndex];
  const currentWaypoint = journeyWaypoints[currentIndex];

  const travelTo = (nextIndex) => {
    const boundedIndex = Math.max(0, Math.min(lifeJourneyMilestones.length - 1, nextIndex));
    setCurrentIndex(boundedIndex);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        sectionActiveRef.current = entry.isIntersecting && entry.intersectionRatio > 0.32;
      },
      { threshold: [0.2, 0.32, 0.55] },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!sectionActiveRef.current || ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        travelTo(currentIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        travelTo(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth) return;
    const targetLeft = (viewport.scrollWidth * currentWaypoint.x) / 100 - viewport.clientWidth / 2;
    viewport.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [currentWaypoint.x, reducedMotion]);

  return (
    <footer id="journey" ref={sectionRef} className="site-footer life-journey">
      <div className="journey-dark-edge" aria-hidden="true" />
      <div className="journey-night-sky" aria-hidden="true">
        {Array.from({ length: 22 }, (_, index) => (
          <i
            key={index}
            style={{
              "--star-x": `${4 + ((index * 43) % 92)}%`,
              "--star-y": `${7 + ((index * 29) % 78)}%`,
              "--star-delay": `${(index % 6) * -0.7}s`,
              "--star-size": `${2 + (index % 3)}px`,
            }}
          />
        ))}
      </div>

      <header className="journey-heading">
        <div>
          <span>LULU / LIFE ROAD</span>
          <h2>人生之路，<br />如流水奔行</h2>
        </div>
      </header>

      <div className="journey-viewport" ref={viewportRef}>
        <div className="journey-stage">
          <StreamArtwork />

          <div className="journey-mist journey-mist-one" aria-hidden="true" />
          <div className="journey-mist journey-mist-two" aria-hidden="true" />

          {lifeJourneyMilestones.map((milestone, index) => {
            const point = journeyWaypoints[index];
            const isCurrent = currentIndex === index;
            const isVisited = index <= currentIndex;
            return (
              <motion.div
                key={milestone.id}
                className={`journey-stone ${isCurrent ? "is-current" : ""} ${isVisited ? "is-visited" : ""}`}
                role="img"
                style={{
                  "--stone-x": `${point.stoneX}%`,
                  "--stone-y": `${point.stoneY}%`,
                  "--stone-angle": `${point.stoneAngle}deg`,
                }}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${milestone.year}，${milestone.title}`}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.82 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                <img src={boulderUrl} alt="" aria-hidden="true" />
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{milestone.year}</strong>
                <i aria-hidden="true" />
              </motion.div>
            );
          })}

          <motion.div
            className="journey-boat-position"
            animate={{
              left: `${currentWaypoint.x}%`,
              top: `${currentWaypoint.y}%`,
              x: "-50%",
              y: "-50%",
              rotate: currentWaypoint.angle,
            }}
            transition={reducedMotion ? { duration: 0 } : { duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="journey-boat-wake" aria-hidden="true" />
            <span className="journey-paper-boat">
              <img src={paperBoatUrl} alt="白色折纸小船" />
            </span>
          </motion.div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.article
          key={currentMilestone.id}
          className="journey-event-card"
          aria-live="polite"
          initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: reducedMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="journey-event-index">
            <span>RIVER NOTE</span>
            <strong>{String(currentIndex + 1).padStart(2, "0")} / {String(lifeJourneyMilestones.length).padStart(2, "0")}</strong>
          </div>
          <time>{currentMilestone.year}</time>
          <h3>{currentMilestone.title}</h3>
          <p>{currentMilestone.description}</p>
        </motion.article>
      </AnimatePresence>

      <nav className="journey-controls" aria-label="人生之路控制">
        <button type="button" onClick={() => travelTo(currentIndex - 1)} disabled={currentIndex === 0}>
          <ArrowLeft size={18} />
          <span>后退</span>
        </button>
        <div>
          <Waves size={16} />
          <span>{String(currentIndex + 1).padStart(2, "0")}</span>
          <i>
            {lifeJourneyMilestones.map((milestone, index) => (
              <b key={milestone.id} className={index === currentIndex ? "is-current" : index < currentIndex ? "is-passed" : ""} />
            ))}
          </i>
          <span>{String(lifeJourneyMilestones.length).padStart(2, "0")}</span>
        </div>
        <button type="button" onClick={() => travelTo(currentIndex + 1)} disabled={currentIndex === lifeJourneyMilestones.length - 1}>
          <span>前进</span>
          <ArrowRight size={18} />
        </button>
      </nav>

      <div className="journey-footer-line">
        <span>******** © {new Date().getFullYear()} Lulu · THE ROAD CONTINUES</span>
        <span>邮箱 xiaowpc1224@gmail.com & 微信 xiaow_1224</span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          返回顶部 <ArrowUp size={14} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
