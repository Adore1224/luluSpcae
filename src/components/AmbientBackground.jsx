import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const AmbientBackground = () => {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) return undefined;

      gsap.to(".ambient-blob-mint", {
        xPercent: 9,
        yPercent: 7,
        scale: 1.08,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".ambient-blob-peach", {
        xPercent: -8,
        yPercent: -10,
        scale: 1.12,
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".ambient-flow path", {
        strokeDashoffset: -180,
        duration: 18,
        repeat: -1,
        ease: "none",
        stagger: 0.8,
      });

      const layers = gsap.utils.toArray("[data-ambient-depth]");
      const setters = layers.map((layer) => ({
        x: gsap.quickTo(layer, "x", { duration: 1.1, ease: "power3.out" }),
        y: gsap.quickTo(layer, "y", { duration: 1.1, ease: "power3.out" }),
        depth: Number(layer.dataset.ambientDepth || 1),
      }));
      const handlePointerMove = (event) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        setters.forEach((setter) => {
          setter.x(x * setter.depth * 10);
          setter.y(y * setter.depth * 8);
        });
      };

      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      return () => window.removeEventListener("pointermove", handlePointerMove);
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="ambient-background" aria-hidden="true">
      <div className="ambient-blob ambient-blob-mint" data-ambient-depth="0.7" />
      <div className="ambient-blob ambient-blob-peach" data-ambient-depth="1" />
      <svg
        className="ambient-flow"
        data-ambient-depth="1.2"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <path d="M-120 710C180 530 310 880 615 672S1048 292 1725 470" />
        <path d="M-80 775C230 595 350 930 660 720S1100 365 1695 520" />
        <path d="M880-120C720 210 1010 340 846 650S670 960 1020 1160" />
      </svg>
      <div className="ambient-orbit ambient-orbit-one" data-ambient-depth="0.8" />
      <div className="ambient-orbit ambient-orbit-two" data-ambient-depth="1.4" />
      <div className="background-grid" />
      <div className="paper-grain" />
    </div>
  );
};

export default AmbientBackground;
