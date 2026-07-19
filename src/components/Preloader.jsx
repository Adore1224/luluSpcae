import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Preloader.css";

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("ESTABLISHING CONNECTIVITY...");

  useEffect(() => {
    const statuses = [
      "ESTABLISHING CONNECTIVITY...",
      "LOADING SPACE ENGINE...",
      "RENDERING HOLOGRAPHIC TILES...",
      "CALIBRATING SENSORS...",
      "STABILIZING MATRIX...",
      "SPACE ONLINE."
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600); // Small pause for dramatic effect
          return 100;
        }
        
        // Random incremental speed for realism
        const increment = Math.floor(Math.random() * 8) + 4;
        const nextProgress = Math.min(prev + increment, 100);

        // Update status based on progress thresholds
        const statusIdx = Math.floor((nextProgress / 100) * (statuses.length - 1));
        setStatus(statuses[statusIdx]);

        return nextProgress;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="preloader-container"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        y: -100,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
      }}
    >
      <div className="preloader-content">
        <motion.div 
          className="preloader-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          LULU'S SPACE
        </motion.div>
        
        <div className="preloader-counter">
          {progress.toString().padStart(3, "0")}%
        </div>
        
        <div className="preloader-progress-track">
          <motion.div 
            className="preloader-progress-bar"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut" }}
          />
        </div>

        <motion.div 
          className="preloader-status"
          key={status}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {status}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Preloader;
