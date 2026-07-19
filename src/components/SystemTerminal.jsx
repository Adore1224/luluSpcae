import React, { useState, useEffect } from "react";
import { terminalCategories, terminalFiles } from "../data/projects";
import { Folder, FileCode, Cpu, Terminal, Calendar, HardDrive, Hash, ChevronRight } from "lucide-react";
import "./SystemTerminal.css";

const SystemTerminal = () => {
  const [activeCategory, setActiveCategory] = useState("projects");
  const [selectedFile, setSelectedFile] = useState(terminalFiles.projects[0]);
  const [terminalLog, setTerminalLog] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Auto-select first file when category changes
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    const files = terminalFiles[categoryId];
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      triggerTerminalLog(categoryId, files[0].name);
    }
  };

  const handleFileChange = (file) => {
    setSelectedFile(file);
    triggerTerminalLog(activeCategory, file.name);
  };

  const triggerTerminalLog = (category, filename) => {
    setIsTyping(true);
    const command = `user@lulu.space:~$ cd /root/${category} && cat ${filename}`;
    setTerminalLog(command);
    
    // Simulate terminal response finish
    setTimeout(() => {
      setIsTyping(false);
    }, 400);
  };

  // Run initial print
  useEffect(() => {
    triggerTerminalLog("projects", terminalFiles.projects[0].name);
  }, []);

  return (
    <div className="terminal-component-wrapper">
      <div className="terminal-section-header">
        <span className="terminal-section-tag">// ARCHIVE LABS</span>
        <h2 className="terminal-section-title">System Console Explorer</h2>
        <p className="terminal-section-desc">
          Browse raw data configurations, source shaders, digital captures, and technical logfiles directly from my local filesystem nodes.
        </p>
      </div>

      {/* Main Terminal Window */}
      <div className="terminal-window glass-panel">
        {/* Terminal Header */}
        <div className="terminal-window-header">
          <div className="terminal-window-dots">
            <span className="terminal-dot term-dot-red"></span>
            <span className="terminal-dot term-dot-yellow"></span>
            <span className="terminal-dot term-dot-green"></span>
          </div>
          <div className="terminal-window-title">
            <Terminal size={12} className="term-title-icon" />
            <span>lulu@space:~/root/{activeCategory}</span>
          </div>
          <div className="terminal-window-cpu">
            <Cpu size={12} className="cpu-icon" />
            <span>SYS_OK</span>
          </div>
        </div>

        {/* Terminal Grid Workspace */}
        <div className="terminal-window-grid">
          
          {/* Col 1: Categories Sidebar */}
          <div className="terminal-col-sidebar">
            <span className="term-sidebar-title">DIRECTORIES</span>
            <div className="term-sidebar-list">
              {terminalCategories.map((category) => (
                <button
                  key={category.id}
                  className={`term-sidebar-item ${activeCategory === category.id ? "active" : ""}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <Folder size={14} className="term-icon-folder" />
                  <span className="term-item-label">{category.label}</span>
                </button>
              ))}
            </div>
            
            <div className="term-sidebar-desc-box">
              <span className="desc-box-title">NODE INFO:</span>
              <p className="desc-box-text">
                {terminalCategories.find(c => c.id === activeCategory)?.desc || ""}
              </p>
            </div>
          </div>

          {/* Col 2: Files Center List */}
          <div className="terminal-col-files">
            <span className="term-files-title">FILES</span>
            <div className="term-files-list">
              {terminalFiles[activeCategory]?.map((file, idx) => (
                <button
                  key={idx}
                  className={`term-file-item ${selectedFile.name === file.name ? "active" : ""}`}
                  onClick={() => handleFileChange(file)}
                >
                  <FileCode size={14} className="term-icon-file" />
                  <div className="term-file-meta-pack">
                    <span className="term-file-name">{file.name}</span>
                    <span className="term-file-size">{file.size}</span>
                  </div>
                  <ChevronRight size={12} className="term-file-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Inspector Panel */}
          <div className="terminal-col-inspector">
            <span className="term-inspector-title">DIAGNOSTIC SCREEN</span>
            
            <div className="term-inspector-body">
              {/* Header Details */}
              <div className="term-inspector-header">
                <h3 className="term-ins-filename">{selectedFile.name}</h3>
                <span className="term-ins-tag">{selectedFile.type}</span>
              </div>

              {/* Data Table */}
              <div className="term-ins-table">
                <div className="term-ins-row">
                  <span><HardDrive size={10} className="row-icon" /> SIZE</span>
                  <span>{selectedFile.size}</span>
                </div>
                <div className="term-ins-row">
                  <span><Calendar size={10} className="row-icon" /> TIMESTAMP</span>
                  <span>{selectedFile.date}</span>
                </div>
                <div className="term-ins-row">
                  <span><Hash size={10} className="row-icon" /> LINES</span>
                  <span>{selectedFile.lines}</span>
                </div>
              </div>

              {/* Console Code Screen */}
              <div className="term-ins-code-box">
                <div className="code-box-header">
                  <span className="code-box-dot"></span>
                  <span>CONSOLE OUTPUT</span>
                </div>
                <pre className="code-pre">
                  <code>{selectedFile.previewText}</code>
                </pre>
              </div>

              {/* Brief Description */}
              <div className="term-ins-details">
                <span className="ins-details-title">SPECIFICATION SUMMARY:</span>
                <p className="ins-details-text">{selectedFile.details}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Bottom Command Console Bar */}
        <div className="terminal-window-footer">
          <div className="term-log-text">
            {terminalLog}
            {isTyping && <span className="term-cursor-blink">_</span>}
          </div>
          <span className="term-status-code">CODE: 0x8F9C</span>
        </div>
      </div>
    </div>
  );
};

export default SystemTerminal;
