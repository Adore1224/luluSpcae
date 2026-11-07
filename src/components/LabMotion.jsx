import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

// A particle crescent and a long, slowly rotating fan of rays.
export function LabOrbit() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let w, h, frame, dots, rays;
    const start = performance.now();
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = Array.from({ length: Math.min(8000, Math.round(w * h / 100)) }, () => {
        const theta = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random());
        const x = Math.cos(theta) * r, y = Math.sin(theta) * r;
        const cut = (x - 0.19) ** 2 + (y + 0.08) ** 2;
        return { x, y, cut, size: 0.7 + Math.random() * 1.4, phase: Math.random() * Math.PI * 2, speed: .5 + Math.random() * 2 };
      }).filter(({ cut }) => cut > 0.96 ** 2 || Math.random() < 0.012);
      rays = Array.from({ length: w < 650 ? 30 : 60 }, () => ({
        angle: (Math.random() - 0.5) * 2.25, length: 1.2 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2, width: .7 + Math.random() * 1.8, alpha: .09 + Math.random() * .14,
      }));
    };
    const draw = (time = start) => {
      const t = (time - start) / 1000;
      const r = Math.min(w, h) * (w < 650 ? 0.43 : 0.41);
      if (!r) return;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w * (w < 650 ? 0.69 : 0.72), h * 0.49);
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, r * .55);
      core.addColorStop(0, 'rgba(19,21,20,0.09)');
      core.addColorStop(1, 'rgba(19,21,20,0)');
      ctx.fillStyle = core;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      ctx.save();
      ctx.rotate(t * .05);
      for (const ray of rays) {
        const len = r * ray.length * (1 + .1 * Math.sin(t + ray.phase));
        const alpha = ray.alpha * (.6 + .4 * Math.sin(t * 1.5 + ray.phase));
        ctx.save(); ctx.rotate(ray.angle + Math.sin(t * .2 + ray.phase) * .1);
        const fade = ctx.createLinearGradient(0, 0, len, 0);
        fade.addColorStop(0, `rgba(16,18,17,${alpha})`);
        fade.addColorStop(.4, `rgba(16,18,17,${alpha * .48})`);
        fade.addColorStop(1, 'rgba(16,18,17,0)');
        ctx.fillStyle = fade; ctx.fillRect(8, -ray.width / 2, len, ray.width); ctx.restore();
      }
      ctx.restore();

      ctx.rotate(t * .08);
      const scale = 1 + Math.sin(t * .8) * .01;
      ctx.scale(scale, scale);
      ctx.fillStyle = '#151716';
      for (const dot of dots) {
        const edge = dot.cut < 1.03;
        ctx.globalAlpha = edge ? .28 + .21 * Math.sin(t * dot.speed * 3 + dot.phase) : .28 + .11 * Math.sin(t * dot.speed + dot.phase);
        ctx.fillRect(dot.x * r, dot.y * r, dot.size, dot.size);
      }
      ctx.restore();
    };
    const tick = (time) => { draw(time); frame = requestAnimationFrame(tick); };
    const refresh = () => { resize(); if (reduced.matches) draw(); };
    const updateMotion = () => {
      cancelAnimationFrame(frame);
      if (reduced.matches) draw();
      else frame = requestAnimationFrame(tick);
    };
    refresh();
    updateMotion();
    const observer = new ResizeObserver(refresh); observer.observe(canvas);
    reduced.addEventListener('change', updateMotion);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); reduced.removeEventListener('change', updateMotion); };
  }, []);
  return <canvas className="lab-orbit" ref={ref} aria-hidden="true" />;
}

export function LabRegistration() {
  return <a className="lab-icp" href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">蜀ICP备2026068626号-1</a>;
}

export function LabFooter({ onClose }) {
  const target = useMotionValue(0);
  const spring = useSpring(target, { damping: 22, stiffness: 260, mass: .7 });
  const rotateY = useTransform(spring, [-1, 1], [-18, 18]);
  const reduced = useReducedMotion();
  return <footer id="lab-footer" className="lab-footer">
    <div className="lab-footer-meta">
      <span>© {new Date().getFullYear()} LULU LAB</span>
      <LabRegistration />
      <div className="lab-footer-actions"><button type="button" onClick={onClose}>返回页面 <ArrowUp size={16} /></button><a href="/">LULULAB.SITE ↗</a></div>
    </div>
    <div className="lab-footer-stage" onPointerMove={(event) => {
      if (event.pointerType !== 'mouse' || reduced) return;
      const rect = event.currentTarget.getBoundingClientRect();
      target.set(Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)));
    }} onPointerLeave={() => target.set(0)}>
      <motion.div className="lab-wordmark" style={{ rotateY }}>
        <span aria-hidden="true">LULU LAB</span><span aria-hidden="true">LULU LAB</span><span aria-hidden="true">LULU LAB</span><strong>LULU LAB</strong>
      </motion.div>
    </div>
  </footer>;
}
