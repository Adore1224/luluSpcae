import React from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import "./Header.css";

const Header = () => {
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header 
      className="header-nav glass-panel"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
    >
      <div className="header-container">
        <a href="#hero" onClick={(e) => scrollToSection(e, "hero")} className="header-logo">
          <Compass className="logo-icon" size={20} />
          <span>LULU'S SPACE</span>
        </a>
        
        <nav className="header-links">
          <a href="#works" onClick={(e) => scrollToSection(e, "works")} className="nav-item">
            <span className="nav-dot"></span>
            WORKS
          </a>
          <a href="#about" onClick={(e) => scrollToSection(e, "about")} className="nav-item">
            <span className="nav-dot"></span>
            ABOUT
          </a>
          <a href="#contact" onClick={(e) => scrollToSection(e, "about")} className="nav-item">
            <span className="nav-dot"></span>
            CONTACT
          </a>
        </nav>

        <div className="header-cta">
          <a href="#about" onClick={(e) => scrollToSection(e, "about")} className="cta-btn">
            SAY HELLO
          </a>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
