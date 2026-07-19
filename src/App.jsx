import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Preloader from "./components/Preloader";

import Hero from "./components/Hero";
import Works from "./components/Works";
import SystemTerminal from "./components/SystemTerminal";
import MoodCanvas from "./components/MoodCanvas";
import ProjectModal from "./components/ProjectModal";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <>
      {/* Cinematic Loader Screen */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <Preloader onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {/* Main Website - Only renders structure once loaded */}
      {!isLoading && (
        <div className="app-content-wrapper">
          {/* Ambient Lighting & Noise Textures */}
          <div className="bg-ambient-glow">
            <div className="bg-glow-1" />
            <div className="bg-glow-2" />
          </div>
          <div className="bg-noise" />

          {/* Core UI */}

          
          <main>
            <Hero />
            <Works onSelectProject={setSelectedProject} />
            
            {/* Playground Sections */}
            <SystemTerminal />
            <MoodCanvas />
          </main>

          <Footer />

          {/* Interactive Modal Overlay */}
          <AnimatePresence>
            {selectedProject && (
              <ProjectModal 
                project={selectedProject} 
                onClose={() => setSelectedProject(null)} 
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

export default App;
