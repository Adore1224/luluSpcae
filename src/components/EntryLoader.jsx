import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import iconUrl from "../assets/icon.svg";

const EntryLoader = () => {
  const overlayRef = useRef(null);
  const progressRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const progressState = { value: 0 };
    const progressTween = gsap.to(progressState, {
      value: 88,
      duration: reducedMotion ? 0.2 : 1.15,
      ease: "power2.out",
      onUpdate: () => setProgress(Math.round(progressState.value)),
    });

    let cancelled = false;
    const minimumWait = new Promise((resolve) => {
      window.setTimeout(resolve, reducedMotion ? 120 : 1050);
    });
    const fontTimeout = new Promise((resolve) => {
      window.setTimeout(resolve, reducedMotion ? 180 : 1600);
    });
    const fontsReady = Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      fontTimeout,
    ]);

    Promise.all([minimumWait, fontsReady]).then(() => {
      if (cancelled) return;
      gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = previousOverflow;
          setVisible(false);
        },
      })
        .to(progressState, {
          value: 100,
          duration: reducedMotion ? 0.08 : 0.32,
          ease: "power2.out",
          onUpdate: () => setProgress(Math.round(progressState.value)),
        })
        .to(progressRef.current, {
          scaleX: 1,
          duration: reducedMotion ? 0.08 : 0.35,
          ease: "power3.out",
        }, "<")
        .to(overlayRef.current, {
          yPercent: -102,
          duration: reducedMotion ? 0.15 : 0.82,
          ease: "power4.inOut",
        }, reducedMotion ? "+=0" : "+=0.16");
    });

    return () => {
      cancelled = true;
      progressTween.kill();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="entry-loader"
      role="status"
      aria-live="polite"
      aria-label={`正在进入 Lulu 的空间，${progress}%`}
    >
      <div className="loader-doodle" aria-hidden="true">
        <span className="loader-orbit" />
        <span className="loader-star">✦</span>
        <span className="loader-pencil">/ / /</span>
        <img className="loader-mark" src={iconUrl} alt="Lulu" />
      </div>
      <div className="loader-copy">
        <span>欢迎来到我的地盘！</span>
        <h1>LULU&apos;S<br />PRIVATE SPACE</h1>
        <p>正在推开门，整理散落的故事与灵感……</p>
      </div>
      <div className="loader-progress">
        <span ref={progressRef} />
        <output>{String(progress).padStart(3, "0")}%</output>
      </div>
      <span className="loader-corner">DESIGN · MOTION · CURIOSITY</span>
    </div>
  );
};

export default EntryLoader;
