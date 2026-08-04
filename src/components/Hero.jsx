import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MapPin, Rotate3D } from "lucide-react";
import { siteProfile } from "../data/siteContent";
import avatarUrl from "../assets/avatar.jpg";
import PersonalCapsule from "./PersonalCapsule";
import BrickCharacter from "./BrickCharacter";

const HangingBadge = ({ flipped, onFlippedChange }) => {
  const rigRef = useRef(null);
  const tiltRef = useRef(null);

  useEffect(() => {
    const updateBadgeScale = () => {
      const viewport = window.visualViewport;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const isPhone = viewportWidth <= 760;
      const widthScale = isPhone
        ? (viewportWidth - 32) / 310
        : viewportWidth / 1600;
      const heightScale = isPhone
        ? (viewportHeight - 90) / 700
        : viewportHeight / 900;
      const minimumScale = isPhone ? 0.8 : 0.82;
      const scale = Math.min(1, Math.max(minimumScale, Math.min(widthScale, heightScale)));

      rigRef.current?.style.setProperty("--badge-scale", scale.toFixed(3));
      rigRef.current?.style.setProperty("--badge-rig-height", `${Math.round(720 * scale)}px`);
    };

    updateBadgeScale();
    window.addEventListener("resize", updateBadgeScale, { passive: true });
    window.visualViewport?.addEventListener("resize", updateBadgeScale, { passive: true });

    return () => {
      window.removeEventListener("resize", updateBadgeScale);
      window.visualViewport?.removeEventListener("resize", updateBadgeScale);
    };
  }, []);

  const handlePointerMove = (event) => {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(tiltRef.current, {
      rotationY: x * 12,
      rotationX: y * -8,
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const resetTilt = () => {
    gsap.to(tiltRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.5)",
      overwrite: "auto",
    });
  };

  return (
    <div ref={rigRef} className="badge-rig">
      <div className="badge-pendulum">
        <div className="badge-strap">
          <span>LULU · DESIGN × TECHNOLOGY · LULU</span>
        </div>
        <div className="badge-clip"><i /></div>
        <div className="badge-swing">
          <div
            ref={tiltRef}
            className="badge-tilt"
            onPointerMove={handlePointerMove}
            onPointerLeave={resetTilt}
          >
            <button
              type="button"
              className={`badge-card-shell ${flipped ? "is-flipped" : ""}`}
              onClick={() => onFlippedChange(!flipped)}
              aria-label={flipped ? "返回工牌正面" : "了解更真实的 Lulu"}
            >
              <span className="badge-face badge-front">
                <span className="badge-topline">
                  <strong>LULU&apos;S SPACE</strong>
                  <small>#0001</small>
                </span>
                <span className="badge-portrait-board">
                  <i className="portrait-doodle doodle-star">✦</i>
                  <i className="portrait-doodle doodle-loop" />
                  <i className="portrait-doodle doodle-wave">∿∿∿</i>
                  <span className="badge-avatar">
                    <img src={avatarUrl} alt="Lulu 的个人头像" />
                  </span>
                </span>
                <span className="badge-name">{siteProfile.name}</span>
                <span className="badge-location"><MapPin size={12} /> {siteProfile.location}</span>
                <span className="badge-details" aria-label="个人资料">
                  <span className="badge-detail-pair">
                    <i>{siteProfile.age}</i>
                    <i>{siteProfile.birthday}</i>
                  </span>
                  <i>{siteProfile.occupation}</i>
                  <i>{siteProfile.education}</i>
                </span>
                <span className="badge-flip-hint">
                  <Rotate3D size={13} /> 背面还要内容哦！
                </span>
              </span>
              <span className="badge-face badge-back">
                <span className="badge-back-eyebrow">A More Genuine Me · 002</span>
                <span className="badge-back-mark">wpc</span>
                <strong>暴雨中前进，<br />伞是倒划天空的船</strong>
                <span className="badge-interest-list">
                  {siteProfile.badgeInterests.map((interest) => (
                    <i key={interest}>{interest}</i>
                  ))}
                </span>
                <q>{siteProfile.lifeAttitude}</q>
                <small><Rotate3D size={13} /> 点击返回正面</small>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Hero = ({ badgeFlipped, onBadgeFlipChange }) => {
  const [activePocketItem, setActivePocketItem] = useState(null);

  const handlePocketItemSelect = (itemId) => {
    setActivePocketItem(itemId);
    window.dispatchEvent(new CustomEvent(
      itemId === "headphones" ? "lulu:audio-play" : "lulu:audio-pause",
    ));
  };

  return (
    <section id="home" className="hero-section immersive-hero hero-object-layout">
      <HangingBadge flipped={badgeFlipped} onFlippedChange={onBadgeFlipChange} />

      <div className="hero-center-stage">
        <PersonalCapsule
          activeItem={activePocketItem}
          onSelectItem={handlePocketItemSelect}
        />
      </div>

      <aside className="hero-pixel-column" aria-label="随个人物品变化的 Lulu 积木人物">
        <BrickCharacter activeItem={activePocketItem} />
      </aside>
    </section>
  );
};

export default Hero;
