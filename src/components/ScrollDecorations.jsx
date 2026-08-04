import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import umbrellaStickerUrl from "../assets/pocket-capsule/umbrella-sticker.png";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ScrollDecorations = ({ rainy }) => {
  const rootRef = useRef(null);

  useGSAP(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return undefined;

    const appShell = rootRef.current.closest(".app-shell");
    const character = rootRef.current.querySelector(".scroll-character-sticker");
    let characterTravelX = 0;
    const updateCharacterTravel = () => {
      const styles = window.getComputedStyle(character);
      const edgeInset = Number.parseFloat(styles.right) || 0;
      characterTravelX = -(window.innerWidth - character.offsetWidth - edgeInset * 2);
    };
    const characterX = gsap.quickTo(character, "x", { duration: 0.38, ease: "power3.out" });
    gsap.set(character, { y: 0, rotation: 0 });
    let characterFrame = 0;

    const updateCharacterPosition = () => {
      window.cancelAnimationFrame(characterFrame);
      characterFrame = window.requestAnimationFrame(() => {
        const documentHeight = document.documentElement.scrollHeight;
        const maximumScroll = Math.max(1, documentHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, window.scrollY / maximumScroll));
        characterX(characterTravelX * progress);
      });
    };

    updateCharacterTravel();
    updateCharacterPosition();
    window.addEventListener("scroll", updateCharacterPosition, { passive: true });
    const handleResize = () => {
      updateCharacterTravel();
      updateCharacterPosition();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    rootRef.current.querySelectorAll(".page-sticker").forEach((sticker, index) => {
      const speed = Number(sticker.dataset.scrollSpeed || 1);
      gsap.fromTo(
        sticker,
        { y: 70 * speed, rotation: index % 2 ? -8 : 8 },
        {
          y: -110 * speed,
          rotation: index % 2 ? 13 : -12,
          ease: "none",
          scrollTrigger: {
            trigger: appShell,
            start: "top top",
            end: "bottom bottom",
            scrub: 1 + index * 0.08,
          },
        },
      );
    });

    const reveal = (target, vars, trigger) => {
      const elements = Array.from(document.querySelectorAll(target));
      const triggerElement = document.querySelector(trigger);
      if (!elements.length) return;
      gsap.from(elements, {
        ...vars,
        scrollTrigger: {
          trigger: triggerElement,
          start: "top 82%",
          end: "top 54%",
          scrub: 0.8,
        },
      });
    };

    reveal(".archive-heading > *", { x: -70, opacity: 0, rotation: -2, stagger: 0.12 }, "#archive");
    reveal(".archive-window", { y: 120, opacity: 0, rotation: 2.5, scale: 0.94 }, "#archive");
    reveal(".archive-entry", { y: 34, opacity: 0, rotation: -1.5, stagger: 0.045 }, ".archive-window");
    reveal(".postcard", { y: 110, opacity: 0, rotation: -3, scale: 0.96 }, "#contact");

    ScrollTrigger.refresh();
    return () => {
      window.cancelAnimationFrame(characterFrame);
      window.removeEventListener("scroll", updateCharacterPosition);
      window.removeEventListener("resize", handleResize);
      characterX.tween.kill();
    };
  }, { scope: rootRef });

  return (
    <div ref={rootRef} className="scroll-decorations" aria-hidden="true">
      <div className={`scroll-character-sticker ${rainy ? "is-rainy" : ""}`}>
        <img src={umbrellaStickerUrl} alt="" draggable="false" />
      </div>
      <div className="page-sticker sticker-flower" data-scroll-speed="1.1">
        <i>✿</i>
        <span>GROW<br />SLOWLY</span>
      </div>
      <div className="page-sticker sticker-smile" data-scroll-speed="1.35">
        <span>◡̈</span>
        <strong>GOOD<br />IDEA?</strong>
      </div>
    </div>
  );
};

export default ScrollDecorations;
