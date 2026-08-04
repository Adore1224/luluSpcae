import { useEffect, useRef } from "react";

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

const CursorTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (window.matchMedia("(pointer: coarse)").matches) return undefined;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const maskCanvas = document.createElement("canvas");
    const maskContext = maskCanvas.getContext("2d");
    const patternCanvas = document.createElement("canvas");
    const patternContext = patternCanvas.getContext("2d");
    const strokes = [];
    let animationFrame = 0;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let lastPoint = null;
    let lastSpawn = 0;

    const buildHalftonePattern = () => {
      patternContext.clearRect(0, 0, viewportWidth, viewportHeight);
      const step = 8;

      for (let y = step / 2; y < viewportHeight; y += step) {
        for (let x = step / 2; x < viewportWidth; x += step) {
          const hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
          if (hash < 0.07) continue;
          const radius = 0.9 + hash * 1.25;
          patternContext.beginPath();
          patternContext.arc(x, y, radius, 0, Math.PI * 2);
          patternContext.fillStyle = `rgba(45, 59, 50, ${0.36 + hash * 0.24})`;
          patternContext.fill();
        }
      }
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.35);
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;

      [canvas, maskCanvas, patternCanvas].forEach((surface) => {
        surface.width = viewportWidth * ratio;
        surface.height = viewportHeight * ratio;
      });

      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      maskContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      patternContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      buildHalftonePattern();
    };

    const addStroke = (x, y, angle, speed, delay = 0) => {
      strokes.push({
        x,
        y,
        angle,
        width: clamp(38 + speed * 0.24, 40, 62),
        length: clamp(68 + speed * 0.72, 72, 138),
        life: 1 - delay,
        decay: 0.014 + Math.min(speed / 9000, 0.009),
      });
      if (strokes.length > 34) strokes.splice(0, strokes.length - 34);
    };

    const startDrawing = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const handlePointerMove = (event) => {
      if (event.pointerType !== "mouse") return;
      const now = performance.now();
      const currentPoint = { x: event.clientX, y: event.clientY };

      if (!lastPoint) {
        lastPoint = currentPoint;
        return;
      }

      const deltaX = currentPoint.x - lastPoint.x;
      const deltaY = currentPoint.y - lastPoint.y;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance < 4 || now - lastSpawn < 12) return;

      const angle = Math.atan2(deltaY, deltaX);
      const steps = Math.min(5, Math.max(1, Math.ceil(distance / 22)));
      for (let index = 1; index <= steps; index += 1) {
        const progress = index / steps;
        addStroke(
          lastPoint.x + deltaX * progress,
          lastPoint.y + deltaY * progress,
          angle,
          distance,
          (steps - index) * 0.025,
        );
      }

      lastPoint = currentPoint;
      lastSpawn = now;
      startDrawing();
    };

    const drawMask = () => {
      maskContext.clearRect(0, 0, viewportWidth, viewportHeight);

      for (let index = strokes.length - 1; index >= 0; index -= 1) {
        const stroke = strokes[index];
        stroke.life -= stroke.decay;

        if (stroke.life <= 0.01) {
          strokes.splice(index, 1);
          continue;
        }

        maskContext.save();
        maskContext.translate(stroke.x, stroke.y);
        maskContext.rotate(stroke.angle);
        maskContext.scale(stroke.length / stroke.width, 1);
        const radius = stroke.width;
        const gradient = maskContext.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${stroke.life * 0.88})`);
        gradient.addColorStop(0.48, `rgba(255, 255, 255, ${stroke.life * 0.72})`);
        gradient.addColorStop(0.78, `rgba(255, 255, 255, ${stroke.life * 0.3})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        maskContext.fillStyle = gradient;
        maskContext.beginPath();
        maskContext.arc(0, 0, radius, 0, Math.PI * 2);
        maskContext.fill();
        maskContext.restore();
      }
    };

    const draw = () => {
      drawMask();
      context.clearRect(0, 0, viewportWidth, viewportHeight);

      if (strokes.length > 0) {
        context.fillStyle = "rgba(247, 248, 243, 0.74)";
        context.fillRect(0, 0, viewportWidth, viewportHeight);
        context.drawImage(patternCanvas, 0, 0, viewportWidth, viewportHeight);
        context.globalCompositeOperation = "destination-in";
        context.drawImage(maskCanvas, 0, 0, viewportWidth, viewportHeight);
        context.globalCompositeOperation = "source-over";
        animationFrame = window.requestAnimationFrame(draw);
        return;
      }

      animationFrame = 0;
    };

    const resetPointer = () => {
      lastPoint = null;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", resetPointer, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-trail" aria-hidden="true" />;
};

export default CursorTrail;
