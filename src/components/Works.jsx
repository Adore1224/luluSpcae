import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { projects } from "../data/projects";
import { ArrowRight, Calendar, Layers } from "lucide-react";
import "./Works.css";

const ProjectCard = ({ project, index, scrollYProgress, totalProjects, onSelect }) => {
  // Calculate specific scroll boundaries for this card
  // If there are N projects, each card takes up a slice of the scroll timeline
  const step = 1 / totalProjects;
  const start = index * step;
  const end = (index + 1) * step;
  
  // Transition points:
  // 1. Entrance: start of this card's slice to start + 25% of slice
  // 2. Solid/Focus: start + 25% to end - 25% of slice
  // 3. Exit: end - 25% to end of slice
  const entryEnd = start + step * 0.25;
  const exitStart = end - step * 0.2;

  // Frame Motion values mapped to this card's specific scroll timeline slice
  const scale = useTransform(
    scrollYProgress,
    [start, entryEnd, exitStart, end],
    [0.85, 1, 1, 1.25] // Card zooms in from back, locks in place, then zooms past the camera
  );
  
  const opacity = useTransform(
    scrollYProgress,
    [start, entryEnd, exitStart, end],
    [0, 1, 1, 0] // Fades in on entry, stays visible, fades out on exit
  );

  const blur = useTransform(
    scrollYProgress,
    [start, entryEnd, exitStart, end],
    ["blur(15px)", "blur(0px)", "blur(0px)", "blur(15px)"] // Blur transitions for dramatic focusing effect
  );

  const textY = useTransform(
    scrollYProgress,
    [start, entryEnd, exitStart, end],
    [50, 0, 0, -80] // Text parallax scrolls upward
  );

  const bgScale = useTransform(
    scrollYProgress,
    [start, end],
    [1.1, 1.3] // Subtle background image drift
  );

  return (
    <motion.div 
      className="work-card-container"
      style={{ opacity, scale, filter: blur }}
    >
      {/* Background ambient texture for each project */}
      <div className="work-card-bg-mask">
        <motion.div 
          className="work-card-ambient-bg" 
          style={{ 
            backgroundImage: `url(${project.image})`,
            scale: bgScale 
          }}
        />
        <div className="work-card-overlay" />
      </div>

      <div className="work-card-content">
        {/* Left Side: Project details and copy */}
        <motion.div className="work-info-col" style={{ y: textY }}>
          <div className="work-index">
            <span>// 0{index + 1}</span>
            <div className="index-line" />
            <span>PORTFOLIO</span>
          </div>

          <h2 className="work-title">
            {project.title}
          </h2>
          <h3 className="work-subtitle">{project.subtitle}</h3>
          
          <p className="work-desc">
            {project.description}
          </p>

          <div className="work-meta-row">
            <span className="work-meta-item">
              <Layers size={14} className="meta-icon" />
              {project.tags[0]}
            </span>
            <span className="work-meta-item">
              <Calendar size={14} className="meta-icon" />
              {project.details.find(d => d.label === "Timeline")?.value || "2026"}
            </span>
          </div>

          <div className="work-tags-list">
            {project.tags.map((tag, idx) => (
              <span key={idx} className="work-tag">{tag}</span>
            ))}
          </div>

          <button className="glass-btn view-project-btn" onClick={() => onSelect(project)}>
            VIEW CASE STUDY <ArrowRight size={14} className="btn-arrow" />
          </button>
        </motion.div>

        {/* Right Side: Interactive Image Preview */}
        <div className="work-preview-col" onClick={() => onSelect(project)}>
          <div className="preview-image-frame glass-panel">
            <div className="preview-scanner-line" />
            <img src={project.image} alt={project.title} className="preview-img" />
            <div className="preview-hover-overlay">
              <span className="hover-action-text">OPEN CASE DETAILS</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Works = ({ onSelectProject }) => {
  const targetRef = useRef(null);
  
  // Track scroll position of the entire works container (height 300vh for 2 projects)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={targetRef} id="works" className="works-section">
      <div className="works-sticky-wrapper">
        <div className="section-title-overlay">
          <span>SELECTED PROJECTS</span>
        </div>

        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            scrollYProgress={scrollYProgress}
            totalProjects={projects.length}
            onSelect={onSelectProject}
          />
        ))}
      </div>
    </section>
  );
};

export default Works;
