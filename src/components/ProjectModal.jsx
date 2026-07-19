import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, Calendar, User, Code, Eye, RefreshCw } from "lucide-react";
import "./ProjectModal.css";

const ProjectModal = ({ project, onClose }) => {
  // Prevent page scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!project) return null;

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="modal-container glass-panel"
        initial={{ y: 50, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 50, scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-grid">
          {/* Column 1: Case Details */}
          <div className="modal-details-col">
            <div className="modal-project-header">
              <span className="modal-tag-lead">// CASE STUDY</span>
              <h2 className="modal-title">{project.title}</h2>
              <h3 className="modal-subtitle">{project.subtitle}</h3>
            </div>

            <div className="modal-body-content">
              <h4 className="section-small-title">OVERVIEW</h4>
              <p className="modal-description">{project.longDescription}</p>

              <h4 className="section-small-title">PROJECT SPECIFICATIONS</h4>
              <div className="spec-table">
                {project.details.map((detail, index) => (
                  <div key={index} className="spec-row">
                    <span className="spec-label">
                      {detail.label === "Role" && <User size={12} className="spec-icon" />}
                      {detail.label === "Timeline" && <Calendar size={12} className="spec-icon" />}
                      {detail.label === "Technologies" && <Code size={12} className="spec-icon" />}
                      {detail.label === "Concept" && <Eye size={12} className="spec-icon" />}
                      {detail.label}
                    </span>
                    <span className="spec-val">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <a 
                href={project.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="glass-btn external-btn"
              >
                OPEN IN NEW TAB <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Column 2: Simulated Browser Iframe */}
          <div className="modal-browser-col">
            <div className="browser-mock-frame glass-panel">
              {/* Browser Header Bar */}
              <div className="browser-header-bar">
                <div className="browser-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="browser-address-bar">
                  <span className="address-protocol">https://</span>
                  <span className="address-domain">lulustudios.dev/{project.title.toLowerCase()}</span>
                </div>
                <div className="browser-actions">
                  <RefreshCw size={12} className="browser-action-icon" />
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={12} className="browser-action-icon link-out" />
                  </a>
                </div>
              </div>

              {/* Iframe View */}
              <div className="browser-viewport">
                <iframe 
                  src={project.url} 
                  title={`${project.title} Preview`}
                  className="preview-iframe"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
                
                {/* Embedded Frame Alert */}
                <div className="iframe-fallback-note">
                  <p>
                    <strong>Interactive Sandbox:</strong> You are browsing in-app. If the page is blank or blocks embedding, please use the button below to launch it directly.
                  </p>
                  <a 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="fallback-action-link"
                  >
                    Launch Live Site <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectModal;
