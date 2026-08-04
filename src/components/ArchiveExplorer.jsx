import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Camera,
  ChevronRight,
  CircleUserRound,
  Columns3,
  Command,
  ExternalLink,
  FileCode2,
  FileText,
  Folder,
  Grid2X2,
  Home,
  Image,
  Info,
  List,
  Search,
  Sparkles,
  StickyNote,
  X,
} from "lucide-react";
import { archiveFolders, siteProfile } from "../data/siteContent";
import AmbientBubbles from "./AmbientBubbles";

const folderIcons = {
  user: CircleUserRound,
  briefcase: BriefcaseBusiness,
  sparkles: Sparkles,
  camera: Camera,
  note: StickyNote,
};

const fileIcons = {
  profile: CircleUserRound,
  collection: Columns3,
  status: Info,
  project: BriefcaseBusiness,
  experiment: FileCode2,
  album: Image,
  note: FileText,
};

const PreviewContent = ({ file }) => {
  if (!file) return null;

  if (file.type === "collection") {
    return (
      <>
        <span className="quicklook-eyebrow">COLLECTION</span>
        <h3>{file.displayName}</h3>
        <div className="quicklook-collection">
          {file.content.map((item) => <span key={item}>{item}</span>)}
        </div>
      </>
    );
  }

  return (
    <>
      <span className="quicklook-eyebrow">{file.type.toUpperCase()}</span>
      <h3>{file.displayName}</h3>
      <p className={file.type === "note" ? "note-content" : ""}>{file.content}</p>
      {file.type === "experiment" && (
        <div className="experiment-preview" aria-hidden="true">
          {Array.from({ length: 14 }, (_, index) => <i key={index} style={{ "--i": index }} />)}
        </div>
      )}
    </>
  );
};

const ProjectDetailModal = ({ file, onClose }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const project = file?.content;
  const projectPages = [
    {
      type: "overview",
      description: project?.overview,
    },
    ...(project?.gallery ?? []).map((item, index) => ({
      type: "image",
      image: item.image,
      description: item.description,
      imageNumber: index + 1,
    })),
  ];
  const activePage = projectPages[pageIndex] ?? projectPages[0];

  useEffect(() => {
    setPageIndex(0);
  }, [file?.id]);

  if (!project) return null;

  return (
    <div
      className="project-detail-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`project-detail-modal ${activePage.type === "overview" ? "is-overview" : "is-image-page"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-detail-title"
      >
        <button
          className="project-detail-close"
          type="button"
          onClick={onClose}
          aria-label="关闭项目详情"
          autoFocus
        >
          <X size={20} />
        </button>

        <div className="project-reader-titlebar">
          <div>
            <strong id="project-detail-title">{project.name}</strong>
            {project.href && (
              <a href={project.href} target="_blank" rel="noreferrer">
                {project.href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          <span>{String(pageIndex + 1).padStart(2, "0")} / {String(projectPages.length).padStart(2, "0")}</span>
        </div>

        <div className="project-detail-copy">
          <div className="project-reader-content">
            <span className="project-detail-eyebrow">
              {activePage.type === "overview"
                ? "PROJECT OVERVIEW"
                : `项目截图 ${String(activePage.imageNumber).padStart(2, "0")}`}
            </span>
            {activePage.type === "overview" && <h2>项目概览</h2>}
            <p className="project-detail-summary">{activePage.description}</p>
          </div>
        </div>

        {activePage.type === "image" && (
          <div className="project-detail-media">
            <figure>
              <img
                src={activePage.image}
                alt={`${project.name} 项目截图 ${activePage.imageNumber}`}
              />
            </figure>
          </div>
        )}

        {projectPages.length > 1 && <>
          <button className="project-page-nav is-prev" type="button" onClick={() => setPageIndex((index) => Math.max(0, index - 1))} disabled={pageIndex === 0} aria-label="上一章节"><ArrowLeft size={20} /></button>
          <button className="project-page-nav is-next" type="button" onClick={() => setPageIndex((index) => Math.min(projectPages.length - 1, index + 1))} disabled={pageIndex === projectPages.length - 1} aria-label="下一章节"><ArrowRight size={20} /></button>
        </>}
      </section>
    </div>
  );
};

const PhotoLightbox = ({ file, onClose }) => (
  <div
    className="photo-lightbox-backdrop"
    role="presentation"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <section className="photo-lightbox" role="dialog" aria-modal="true" aria-label="图片查看器">
      <button className="photo-lightbox-close" type="button" onClick={onClose} aria-label="关闭图片" autoFocus>
        <X size={20} />
      </button>
      <img src={file.thumbnail} alt="" />
    </section>
  </div>
);

const ArchiveExplorer = () => {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedId, setSelectedId] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [query, setQuery] = useState("");
  const [windowState, setWindowState] = useState("open");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [commandValue, setCommandValue] = useState("");
  const [commandOutput, setCommandOutput] = useState("输入 help 查看可用命令");
  const explorerRef = useRef(null);

  const currentFolder = archiveFolders.find((folder) => folder.id === currentFolderId) ?? null;

  const entries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      return archiveFolders.flatMap((folder) =>
        folder.files
          .filter((file) =>
            [file.name, file.displayName, ...file.tags].join(" ").toLowerCase().includes(normalizedQuery),
          )
          .map((file) => ({ ...file, folderId: folder.id })),
      );
    }
    if (currentFolder) return currentFolder.files.map((file) => ({ ...file, folderId: currentFolder.id }));
    return archiveFolders.map((folder) => ({ ...folder, type: "folder", name: folder.label }));
  }, [currentFolder, query]);

  const navigateTo = useCallback((folderId, recordHistory = true) => {
    setCurrentFolderId(folderId);
    setSelectedId(null);
    setPreviewFile(null);
    setQuery("");
    if (recordHistory) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(folderId);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  }, [history, historyIndex]);

  const goBack = () => {
    if (historyIndex <= 0) {
      navigateTo(null, false);
      setHistoryIndex(-1);
      return;
    }
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    navigateTo(history[nextIndex], false);
  };

  const goForward = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    navigateTo(history[nextIndex], false);
  };

  const openEntry = useCallback((entry) => {
    if (entry.type === "folder") {
      navigateTo(entry.id);
      return;
    }
    if (entry.type === "project-folder" || entry.type === "album") {
      setPreviewFile(entry);
      return;
    }
    setPreviewFile(entry);
  }, [navigateTo]);

  useEffect(() => {
    if (!previewFile || !["project-folder", "album"].includes(previewFile.type)) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setPreviewFile(null);
    };
    const preventScroll = (event) => event.preventDefault();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, [previewFile]);

  useEffect(() => {
    const handleOpenFolder = (event) => {
      const folderId = event.detail?.folderId;
      const fileId = event.detail?.fileId;
      const targetFolder = archiveFolders.find((folder) => folder.id === folderId);
      if (targetFolder) {
        setWindowState("open");
        navigateTo(folderId);
        if (fileId) {
          const targetFile = targetFolder.files.find((file) => file.id === fileId);
          if (targetFile) {
            setSelectedId(fileId);
            setPreviewFile(targetFile);
          }
        }
      }
    };
    window.addEventListener("lulu:open-folder", handleOpenFolder);
    return () => window.removeEventListener("lulu:open-folder", handleOpenFolder);
  }, [navigateTo]);

  useEffect(() => {
    const handleTerminalOutput = (event) => {
      const output = event.detail?.output;
      if (typeof output === "string" && output.trim()) {
        setCommandOutput(output);
      }
    };
    window.addEventListener("lulu:terminal-output", handleTerminalOutput);
    return () => window.removeEventListener("lulu:terminal-output", handleTerminalOutput);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (previewFile) return;
      if (!explorerRef.current?.contains(document.activeElement)) return;
      if (event.key === "Escape") {
        setPreviewFile(null);
        setSelectedId(null);
      }
      if (event.key === "Backspace" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        event.preventDefault();
        navigateTo(null);
      }
      if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
        if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
        event.preventDefault();
        const selectedIndex = entries.findIndex((entry) => entry.id === selectedId);
        const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
        const nextIndex = Math.max(0, Math.min(entries.length - 1, selectedIndex + direction));
        setSelectedId(entries[nextIndex]?.id ?? null);
      }
      if (event.key === "Enter" && selectedId && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        const entry = entries.find((item) => item.id === selectedId);
        if (entry) openEntry(entry);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [entries, navigateTo, openEntry, previewFile, selectedId]);

  const runCommand = (event) => {
    event.preventDefault();
    const raw = commandValue.trim();
    const [command, ...args] = raw.toLowerCase().split(/\s+/);
    const target = args.join(" ");

    if (!raw) return;
    if (command === "help") {
      setCommandOutput("help · ls · whoami · open [目录] · home · clear");
    } else if (command === "ls") {
      setCommandOutput(
        currentFolder
          ? currentFolder.files.map((file) => file.name).join("  ")
          : archiveFolders.map((folder) => `${folder.id}/`).join("  "),
      );
    } else if (command === "whoami") {
      setCommandOutput(`${siteProfile.name} — ${siteProfile.role}`);
    } else if (command === "open") {
      const folder = archiveFolders.find((item) =>
        [item.id, item.label.toLowerCase(), item.englishLabel.toLowerCase()].some((value) => value.includes(target)),
      );
      if (folder) {
        navigateTo(folder.id);
        setCommandOutput(`opened ~/${folder.id}`);
      } else {
        setCommandOutput(`找不到目录：${target || "(empty)"}`);
      }
    } else if (command === "home") {
      navigateTo(null);
      setCommandOutput("returned to ~/lulu/space");
    } else if (command === "clear") {
      setCommandOutput("");
    } else {
      setCommandOutput(`command not found: ${command}`);
    }
    setCommandValue("");
  };

  if (windowState === "closed") {
    return (
      <section id="archive" className="archive-section section-shell">
        <button className="archive-launcher" type="button" onClick={() => setWindowState("open")}>
          <Folder size={34} fill="currentColor" />
          <span>重新打开 Lulu Explorer</span>
        </button>
      </section>
    );
  }

  return (
    <section id="archive" className="archive-section">
      <AmbientBubbles variant="archive" />
      <div className="section-shell">
        <div className="section-heading archive-heading">
          <div>
            <span className="section-kicker">Lulu Explorer</span>
          </div>
        </div>

        <div
          ref={explorerRef}
          className={`archive-window ${isFullscreen ? "is-fullscreen" : ""} ${windowState === "minimized" ? "is-minimized" : ""}`}
          tabIndex={0}
        >
          <header className="archive-titlebar">
            <div className="window-controls" aria-label="窗口控制">
              <button
                type="button"
                className="control-close"
                onClick={() => setWindowState("closed")}
                aria-label="关闭窗口"
                data-tooltip="关闭窗口"
              />
              <button
                type="button"
                className="control-minimize"
                onClick={() => setWindowState((state) => state === "minimized" ? "open" : "minimized")}
                aria-label={windowState === "minimized" ? "还原窗口" : "最小化窗口"}
                data-tooltip={windowState === "minimized" ? "还原窗口" : "最小化窗口"}
              />
              <button
                type="button"
                className="control-fullscreen"
                onClick={() => setIsFullscreen((value) => !value)}
                aria-label={isFullscreen ? "退出全屏" : "进入全屏"}
                data-tooltip={isFullscreen ? "退出全屏" : "进入全屏"}
              />
            </div>
            <span>~/lulu/space{currentFolder ? `/${currentFolder.id}` : ""}</span>
          </header>

          {windowState !== "minimized" && (
            <>
              <div className="archive-toolbar">
                <div className="history-controls">
                  <button type="button" onClick={goBack} aria-label="返回"><ArrowLeft size={17} /></button>
                  <button type="button" onClick={goForward} disabled={historyIndex >= history.length - 1} aria-label="前进"><ArrowRight size={17} /></button>
                </div>
                <div className="archive-breadcrumb">
                  <button type="button" onClick={() => navigateTo(null)}><Home size={14} /> lulu</button>
                  {currentFolder && <><ChevronRight size={13} /><span>{currentFolder.label}</span></>}
                </div>
                <label className="archive-search">
                  <Search size={14} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文件" />
                  {query && <button type="button" onClick={() => setQuery("")} aria-label="清除搜索"><X size={13} /></button>}
                </label>
                <div className="view-controls">
                  <button type="button" className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")} aria-label="图标视图"><Grid2X2 size={15} /></button>
                  <button type="button" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")} aria-label="列表视图"><List size={16} /></button>
                </div>
              </div>

              <div className="archive-body">
                <aside className="archive-sidebar">
                  <span>Favorites</span>
                  <button type="button" className={!currentFolderId ? "active" : ""} onClick={() => navigateTo(null)}>
                    <Home size={16} /> 主页目录
                  </button>
                  {archiveFolders.map((folder) => {
                    const Icon = folderIcons[folder.icon];
                    return (
                      <button
                        type="button"
                        key={folder.id}
                        className={currentFolderId === folder.id ? "active" : ""}
                        onClick={() => navigateTo(folder.id)}
                      >
                        <Icon size={16} style={{ color: folder.color }} />
                        {folder.label}
                      </button>
                    );
                  })}
                  <div className="sidebar-storage">
                    <span>The end of life</span>
                    <i><b /></i>
                    <small>人生永远没有终点</small>
                  </div>
                </aside>

                <main className={`archive-main ${currentFolder ? "is-folder-view" : ""}`}>
                  {!currentFolder && (
                    <div className="archive-path-intro">
                      <div>
                        <span>{query ? "SEARCH RESULTS" : "LULU'S SPACE"}</span>
                        <h3>{query ? `“${query}”` : "想先看看哪个？"}</h3>
                      </div>
                      <small>{`${entries.length} items`}</small>
                    </div>
                  )}

                  <div className={`archive-entries view-${viewMode}`} role="listbox" aria-label="文件列表">
                    {entries.length === 0 ? (
                      <div className="archive-empty-state">将照片放入 src/assets/picture 后，这里会自动出现。</div>
                    ) : entries.map((entry) => {
                      const isFolderEntry = entry.type === "folder" || entry.type === "project-folder";
                      const Icon = isFolderEntry
                        ? (entry.type === "folder" ? folderIcons[entry.icon] : BriefcaseBusiness)
                        : fileIcons[entry.type] ?? FileText;
                      const color = entry.type === "folder"
                        ? entry.color
                        : archiveFolders.find((folder) => folder.id === entry.folderId)?.color;
                      return (
                        <button
                          key={`${entry.folderId ?? "root"}-${entry.id}`}
                          type="button"
                          className={`archive-entry ${entry.type === "project-folder" ? "is-project-folder" : ""} ${entry.type === "album" ? "is-album" : ""} ${selectedId === entry.id ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedId(entry.id);
                            if (entry.type === "project-folder" || entry.type === "album") openEntry(entry);
                          }}
                          onDoubleClick={() => openEntry(entry)}
                          role="option"
                          aria-selected={selectedId === entry.id}
                        >
                          {isFolderEntry ? (
                            <span className="folder-art" style={{ "--folder-color": color }}>
                              <i />
                              <Icon size={28} />
                            </span>
                          ) : entry.thumbnail ? (
                            <span className="file-thumbnail"><img src={entry.thumbnail} alt="" /></span>
                          ) : (
                            <span className="file-art" style={{ "--file-color": color }}>
                              <Icon size={30} />
                              <i>{entry.type.slice(0, 3).toUpperCase()}</i>
                            </span>
                          )}
                          <span className="entry-info">
                            <strong>{entry.displayName ?? entry.label}</strong>
                            <small>{entry.type === "folder" ? entry.description : entry.name}</small>
                          </span>
                          <span className="entry-list-meta">{entry.modified ?? `${entry.files.length} files`}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="archive-statusbar" aria-live="polite">
                    {selectedId
                      ? `已选择：${entries.find((entry) => entry.id === selectedId)?.displayName ?? entries.find((entry) => entry.id === selectedId)?.label}`
                      : "单击选择 · 双击打开 · 方向键浏览 · Enter 打开"}
                  </div>
                </main>

                {previewFile && !["project-folder", "album"].includes(previewFile.type) && (
                  <aside className="quicklook-panel">
                    <header>
                      <span>QUICK LOOK</span>
                      <button type="button" onClick={() => setPreviewFile(null)} aria-label="关闭预览"><X size={17} /></button>
                    </header>
                    <div className="quicklook-scroll"><PreviewContent file={previewFile} /></div>
                  </aside>
                )}
              </div>

              <form className="archive-commandbar" onSubmit={runCommand}>
                <Command size={14} />
                <span>lulu@space:~$</span>
                <input
                  value={commandValue}
                  onChange={(event) => setCommandValue(event.target.value)}
                  placeholder="输入 help、ls、whoami 或 open projects"
                  aria-label="命令输入"
                />
                <output>{commandOutput}</output>
              </form>
            </>
          )}
        </div>
      </div>
      {previewFile?.type === "project-folder" && (
        <ProjectDetailModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
      {previewFile?.type === "album" && (
        <PhotoLightbox file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </section>
  );
};

export default ArchiveExplorer;
