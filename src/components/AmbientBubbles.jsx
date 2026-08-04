import { useEffect, useRef, useState } from "react";

const bubbleSpecs = [
  { x: 3, size: 78, duration: 24, delay: -7, sway: 24, tone: ["#c9ddd0", "#7fa891"] },
  { x: 8, size: 112, duration: 31, delay: -21, sway: -34, tone: ["#f2c9b8", "#dc927c"] },
  { x: 13, size: 54, duration: 21, delay: -13, sway: 19, tone: ["#d8d0ef", "#a99bcf"] },
  { x: 17, size: 86, duration: 28, delay: -3, sway: -27, tone: ["#f1e1a5", "#d4b95f"] },
  { x: 6, size: 44, duration: 19, delay: -16, sway: 16, tone: ["#c9e2e1", "#72a9a7"] },
  { x: 83, size: 94, duration: 29, delay: -18, sway: 31, tone: ["#d6e6cc", "#8aae78"] },
  { x: 88, size: 60, duration: 22, delay: -5, sway: -18, tone: ["#f2c5cc", "#d88d9c"] },
  { x: 93, size: 120, duration: 34, delay: -26, sway: 37, tone: ["#cbd8ef", "#809bc9"] },
  { x: 97, size: 72, duration: 26, delay: -11, sway: -23, tone: ["#efd5ba", "#cf9d6d"] },
];

const AmbientBubbles = ({ variant = "archive" }) => {
  const visibleSpecs = variant === "footer" ? bubbleSpecs.slice(1, 8) : bubbleSpecs;
  const [bubbleState, setBubbleState] = useState(() =>
    Object.fromEntries(visibleSpecs.map((_, index) => [index, { popped: false, version: 0 }])),
  );
  const timersRef = useRef(new Map());

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const popBubble = (index) => {
    if (bubbleState[index]?.popped) return;

    setBubbleState((current) => ({
      ...current,
      [index]: { ...current[index], popped: true },
    }));

    const timer = window.setTimeout(() => {
      setBubbleState((current) => ({
        ...current,
        [index]: {
          popped: false,
          version: (current[index]?.version ?? 0) + 1,
        },
      }));
      timersRef.current.delete(index);
    }, 850);

    timersRef.current.set(index, timer);
  };

  return (
    <div className={`ambient-bubbles ambient-bubbles-${variant}`} aria-hidden="false">
      {visibleSpecs.map((bubble, index) => {
        const state = bubbleState[index] ?? { popped: false, version: 0 };

        return (
          <span
            className="ambient-bubble-path"
            key={`${variant}-${index}-${state.version}`}
            style={{
              "--bubble-x": `${bubble.x}%`,
              "--bubble-size": `${bubble.size}px`,
              "--bubble-duration": `${bubble.duration}s`,
              "--bubble-delay": state.version > 0 ? "0s" : `${bubble.delay}s`,
              "--bubble-sway": `${bubble.sway}px`,
              "--bubble-light": bubble.tone[0],
              "--bubble-deep": bubble.tone[1],
            }}
          >
            <button
              className={`ambient-bubble ${state.popped ? "is-popped" : ""}`}
              type="button"
              onClick={() => popBubble(index)}
              aria-label="戳破一颗漂浮气泡"
              title="戳破气泡"
            >
              <span className="bubble-glint" />
              {Array.from({ length: 7 }, (_, particleIndex) => (
                <i key={particleIndex} style={{ "--particle-index": particleIndex }} />
              ))}
            </button>
          </span>
        );
      })}
    </div>
  );
};

export default AmbientBubbles;
