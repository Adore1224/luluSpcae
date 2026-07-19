import React from "react";
import { Mail, ArrowUpRight, Compass } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="about" className="footer-section">
      <div className="footer-container">
        {/* Top Segment: Large CTA & Callouts */}
        <div className="footer-top-grid">
          <div className="footer-cta-col">
            <span className="footer-tag">// PROJECT INQUIRIES</span>
            <h2 className="footer-cta-title">
              Let's create something <br />
              <span className="text-gradient-gold">extraordinary</span> together.
            </h2>
            <div className="footer-contact-links">
              <a href="mailto:lulu@space.dev" className="contact-link-item">
                <Mail size={16} className="contact-icon" />
                <span>lulu@space.dev</span>
                <ArrowUpRight size={14} className="contact-arrow" />
              </a>
            </div>
          </div>

          <div className="footer-info-col">
            <span className="footer-tag">// ABOUT ME</span>
            <p className="footer-bio">
              Lulu is a creative developer and spatial designer specializing in premium WebGL spaces, interactive narrative interfaces, and modern front-end layouts. Bridging the gap between engineering complexity and visual elegance.
            </p>
            
            <div className="footer-socials">
              {/* Custom GitHub SVG matching Lucide outline properties */}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn glass-panel" title="GitHub">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="lucide-custom"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>

              {/* Custom LinkedIn SVG matching Lucide outline properties */}
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn glass-panel" title="LinkedIn">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="lucide-custom"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Middle Divider */}
        <div className="footer-divider" />

        {/* Bottom Segment: Site Info, Copyright, Personal Info Small Print */}
        <div className="footer-bottom-row">
          <div className="footer-brand">
            <a href="#hero" onClick={handleScrollToTop} className="footer-logo">
              <Compass className="footer-logo-icon" size={16} />
              <span>LULU'S SPACE</span>
            </a>
          </div>

          {/* User's Small Print Personal Info */}
          <div className="footer-personal-details">
            <p className="small-print-text">
              Lulu Chen &bull; Front-End Architect &bull; Shanghai, CN &bull; Available for freelance & collaborations
            </p>
          </div>

          <div className="footer-copyright">
            <p className="small-print-text">
              &copy; {currentYear} Lulu's Space. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
