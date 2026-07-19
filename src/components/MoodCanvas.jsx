import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { moodCanvasCards } from "../data/projects";
import { Play, Pause, Disc, FileText, Activity, Layers, CornerDownRight } from "lucide-react";
import "./MoodCanvas.css";

const MoodCard = ({ card, constraintsRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [zValue, setZValue] = useState(card.id); // Base depth matches ID

  const handleHoverStart = () => {
    // Bring hovered card to the very top
    setZValue(999);
  };

  const handleHoverEnd = () => {
    // Reset depth to standard base ID
    setZValue(card.id);
  };

  return (
    <motion.div
      className={`mood-card glass-panel card-type-${card.type}`}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.1}
      whileDrag={{ scale: 1.08, zIndex: 1000, boxShadow: "0 25px 50px rgba(0,0,0,0.6)" }}
      whileHover={{ 
        scale: 1.05, 
        rotate: 0, 
        zIndex: 999,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      style={{
        left: card.defaultX,
        top: card.defaultY,
        rotate: card.defaultRotation,
        zIndex: zValue,
        position: "absolute"
      }}
    >
      {/* Tape Indicator (Retro Skeuomorphic Touch) */}
      <div className="card-top-tape" />

      {/* Card Header */}
      <div className="card-header-bar">
        <span className="card-header-title">
          {card.type === "playlist" && <Disc size={12} className="card-header-icon rotate-spin" />}
          {card.type === "note" && <FileText size={12} className="card-header-icon" />}
          {card.type === "stats" && <Activity size={12} className="card-header-icon" />}
          {card.type === "image" && <Layers size={12} className="card-header-icon" />}
          {card.title}
        </span>
        <span className="card-header-type">// {card.type.toUpperCase()}</span>
      </div>

      {/* Card Content Renderers */}
      <div className="card-body-container">
        
        {/* Playlist Card Type */}
        {card.type === "playlist" && (
          <div className="playlist-mini-player">
            <div className="player-disc-group">
              <motion.div 
                className="disc-svg-wrap"
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={isPlaying ? { repeat: Infinity, duration: 8, ease: "linear" } : { duration: 0.5 }}
              >
                <Disc size={44} className="player-vinyl-disc" />
              </motion.div>
              <div className="player-track-info">
                <span className="player-track">{card.content.track}</span>
                <span className="player-artist">{card.content.artist}</span>
              </div>
            </div>

            {/* Fake Visualizer */}
            <div className="player-visualizer">
              <span className={`bar bar-1 ${isPlaying ? "active" : ""}`}></span>
              <span className={`bar bar-2 ${isPlaying ? "active" : ""}`}></span>
              <span className={`bar bar-3 ${isPlaying ? "active" : ""}`}></span>
              <span className={`bar bar-4 ${isPlaying ? "active" : ""}`}></span>
              <span className={`bar bar-5 ${isPlaying ? "active" : ""}`}></span>
            </div>

            <div className="player-controls">
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className={`player-play-btn ${isPlaying ? "playing" : ""}`}
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                <span>{isPlaying ? "PAUSE FEED" : "LISTEN LIVE"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Image Card Type */}
        {card.type === "image" && (
          <div className="card-image-wrapper">
            <img src={card.content} alt={card.title} className="card-embedded-img" />
          </div>
        )}

        {/* Note Card Type */}
        {card.type === "note" && (
          <div className="card-note-wrapper">
            <p className="card-note-paragraph">"{card.content}"</p>
          </div>
        )}

        {/* Stats Card Type */}
        {card.type === "stats" && (
          <div className="card-stats-wrapper">
            {Object.entries(card.content).map(([label, value], idx) => (
              <div key={idx} className="card-stats-row">
                <span className="stats-row-lbl">{label}</span>
                <span className="stats-row-val">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Info Overlay / Caption */}
      <div className="card-caption-drawer">
        <CornerDownRight size={10} className="caption-drawer-arrow" />
        <span className="caption-drawer-desc">{card.description}</span>
      </div>
    </motion.div>
  );
};

const MoodCanvas = () => {
  const containerRef = useRef(null);

  return (
    <div className="mood-canvas-component-wrapper">
      <div className="mood-canvas-section-header">
        <span className="mood-canvas-section-tag">// DESIGN WORKBENCH</span>
        <h2 className="mood-canvas-section-title">Holographic Mood Board</h2>
        <p className="mood-canvas-section-desc">
          An interactive collage of creative stimuli, logs, and conceptual graphics. **Click, hold, and drag** the cards around to rearrange my thoughts.
        </p>
      </div>

      {/* Sandbox Drag Area */}
      <div ref={containerRef} className="mood-canvas-sandbox glass-panel">
        {/* Grid background lines */}
        <div className="sandbox-grid-overlay" />
        <div className="sandbox-radar-pulse" />

        {/* Drag Cards */}
        {moodCanvasCards.map((card) => (
          <MoodCard 
            key={card.id} 
            card={card} 
            constraintsRef={containerRef} 
          />
        ))}
      </div>
    </div>
  );
};

export default MoodCanvas;
