import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Terminal, MapPin, Sparkles, Zap, Coffee } from "lucide-react";
import "./Hero.css";

const Hero = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Canvas particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.2 + 0.3;
        this.speedX = Math.random() * 0.1 - 0.05;
        this.speedY = Math.random() * 0.1 - 0.05;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 18000));
    const particles = Array.from({ length: count }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 10,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, "#08080c");
      gradient.addColorStop(1, "#040406");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleScrollClick = () => {
    const worksSection = document.getElementById("works");
    if (worksSection) worksSection.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={containerRef} id="hero" className="hero-section">
      <canvas ref={canvasRef} className="hero-canvas" />

      <motion.div
        className="hero-scattered-layout"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {/* ===== LEFT COLUMN: ID Badge ===== */}
        <motion.div
          className="hero-id-badge glass-panel"
          initial={{ opacity: 0, x: -40, rotate: -3 }}
          animate={{ opacity: 1, x: 0, rotate: -2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        >
          {/* Lanyard Clip */}
          <div className="badge-lanyard">
            <div className="lanyard-clip" />
            <div className="lanyard-string" />
          </div>

          <div className="badge-inner">
            {/* Badge Header */}
            <div className="badge-header">
              <span className="badge-org">LULU'S SPACE</span>
              <span className="badge-id-num">#0001</span>
            </div>

            {/* Avatar */}
            <div className="badge-avatar-frame">
              <img src="/avatar.png" alt="Lulu Avatar" className="badge-avatar-img" />
            </div>

            {/* Name & Title */}
            <div className="badge-info">
              <h3 className="badge-name">LULU</h3>
              <span className="badge-title">Creative Developer & Spatial Designer</span>
            </div>

            {/* Tags */}
            <div className="badge-tags">
              <span className="badge-tag"><Zap size={10} /> WebGL</span>
              <span className="badge-tag"><Sparkles size={10} /> UI/UX</span>
              <span className="badge-tag"><Coffee size={10} /> React</span>
            </div>

            {/* Location */}
            <div className="badge-location">
              <MapPin size={10} />
              <span>Shanghai, CN</span>
            </div>

            {/* QR/Barcode Strip */}
            <div className="badge-barcode">
              <div className="barcode-lines">
                {Array.from({ length: 28 }, (_, i) => (
                  <span key={i} className="barcode-line" style={{ height: `${Math.random() * 14 + 8}px` }} />
                ))}
              </div>
              <span className="barcode-text">ID-2026-LULU-SPACE</span>
            </div>
          </div>
        </motion.div>

        {/* ===== CENTER COLUMN: Main Branding + Terminal ===== */}
        <div className="hero-center-column">
          {/* Title Block */}
          <motion.div
            className="hero-title-block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          >
            <span className="hero-greeting">Hi, I'm Lulu 👋</span>
            <h1 className="hero-main-title">
              I design & build<br />
              <span className="text-gradient-gold">digital experiences</span>
            </h1>
            <p className="hero-tagline">
              Exploring the intersection of spatial interfaces, generative art, and high-fidelity web engineering. I think, prototype, and ship.
            </p>
          </motion.div>

          {/* Mini Terminal */}
          <motion.div
            className="hero-mini-terminal glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          >
            <div className="mini-term-header">
              <div className="mini-term-dots">
                <span className="mt-dot mt-r"></span>
                <span className="mt-dot mt-y"></span>
                <span className="mt-dot mt-g"></span>
              </div>
              <span className="mini-term-path">
                <Terminal size={10} /> lulu — zsh
              </span>
            </div>
            <div className="mini-term-body">
              <div className="term-line">
                <span className="term-prompt">$</span>
                <span className="term-cmd">whoami</span>
              </div>
              <div className="term-output">Creative Developer with a passion for WebGL,</div>
              <div className="term-output">spatial UI, and cinematic web experiences.</div>
              <div className="term-line mt-gap">
                <span className="term-prompt">$</span>
                <span className="term-cmd">ls interests/</span>
              </div>
              <div className="term-output term-highlight">WebGL/  React/  Shaders/  SpatialUI/  Photography/</div>
              <div className="term-line mt-gap">
                <span className="term-prompt">$</span>
                <span className="term-cursor">_</span>
              </div>
            </div>
          </motion.div>

          {/* Scroll CTA */}
          <motion.div
            className="hero-scroll-cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <button onClick={handleScrollClick} className="glass-btn explore-btn">
              EXPLORE WORKS <ArrowDown size={14} />
            </button>
          </motion.div>
        </div>

        {/* ===== RIGHT COLUMN: Scattered Elements ===== */}
        <div className="hero-right-cluster">
          {/* Status Sticker */}
          <motion.div
            className="hero-sticker sticker-design glass-panel"
            initial={{ opacity: 0, rotate: 8, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 4, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <span className="sticker-line-1">DESIGN</span>
            <span className="sticker-x">×</span>
            <span className="sticker-line-2">CODE</span>
            <div className="sticker-glow" />
          </motion.div>

          {/* Polaroid Image 1 */}
          <motion.div
            className="hero-polaroid polaroid-1"
            initial={{ opacity: 0, y: 30, rotate: 5 }}
            animate={{ opacity: 1, y: 0, rotate: 3 }}
            transition={{ duration: 0.7, delay: 0.9 }}
          >
            <div className="polaroid-inner">
              <img src="/aetheria.png" alt="Work preview 1" className="polaroid-img" />
              <span className="polaroid-caption">generative landscapes ✦</span>
            </div>
          </motion.div>

          {/* Polaroid Image 2 */}
          <motion.div
            className="hero-polaroid polaroid-2"
            initial={{ opacity: 0, y: 20, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: -5 }}
            transition={{ duration: 0.7, delay: 1.0 }}
          >
            <div className="polaroid-inner">
              <img src="/chronos.png" alt="Work preview 2" className="polaroid-img" />
              <span className="polaroid-caption">spatial interfaces ◆</span>
            </div>
          </motion.div>

          {/* Availability Badge */}
          <motion.div
            className="hero-availability-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <span className="avail-dot" />
            <span>Open for collaborations</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll hint at bottom */}
      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 1.5 }}
      >
        <span>SCROLL</span>
      </motion.div>
    </section>
  );
};

export default Hero;
