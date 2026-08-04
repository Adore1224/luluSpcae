import { useEffect, useRef, useState } from "react";
import {
  Music2,
  ListMusic,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
} from "lucide-react";
import { musicTracks } from "../data/musicLibrary";

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

const MusicPlayer = () => {
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.2);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const hasTracks = musicTracks.length > 0;
  const activeTrack = musicTracks[trackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!playing || !audioRef.current || !activeTrack) return;
    audioRef.current.play().catch(() => setPlaying(false));
  }, [activeTrack, playing]);

  useEffect(() => {
    if (!playlistOpen && !volumeOpen) return undefined;

    const closePanels = () => {
      setPlaylistOpen(false);
      setVolumeOpen(false);
    };
    const handlePointerDown = (event) => {
      if (!playerRef.current?.contains(event.target)) closePanels();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closePanels();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [playlistOpen, volumeOpen]);

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !hasTracks) return;

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
  };

  const togglePlayback = async () => {
    if (playing) {
      pauseAudio();
      return;
    }

    await playAudio();
  };

  const changeTrack = (direction) => {
    if (!hasTracks) return;
    setTrackIndex((index) => (
      (index + direction + musicTracks.length) % musicTracks.length
    ));
    setCurrentTime(0);
    setDuration(0);
  };

  const selectTrack = (index) => {
    setTrackIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setPlaying(true);
  };

  const handleEnded = () => {
    if (musicTracks.length <= 1) return;
    setPlaying(true);
    changeTrack(1);
  };

  useEffect(() => {
    const publishAudioState = () => {
      window.dispatchEvent(new CustomEvent("lulu:audio-state", {
        detail: {
          playing,
          title: activeTrack?.title ?? "等待播放",
          number: activeTrack?.number ?? "--",
          trackIndex,
          trackCount: musicTracks.length,
        },
      }));
    };

    publishAudioState();
    window.addEventListener("lulu:audio-request-state", publishAudioState);
    return () => window.removeEventListener("lulu:audio-request-state", publishAudioState);
  }, [activeTrack, playing, trackIndex]);

  useEffect(() => {
    const handleExternalToggle = () => togglePlayback();
    const handleExternalPlay = () => {
      void playAudio();
    };
    const handleExternalPause = () => pauseAudio();
    const handleExternalNext = () => {
      if (!hasTracks) return;
      setPlaying(true);
      changeTrack(1);
    };

    window.addEventListener("lulu:audio-toggle", handleExternalToggle);
    window.addEventListener("lulu:audio-play", handleExternalPlay);
    window.addEventListener("lulu:audio-pause", handleExternalPause);
    window.addEventListener("lulu:audio-next", handleExternalNext);
    return () => {
      window.removeEventListener("lulu:audio-toggle", handleExternalToggle);
      window.removeEventListener("lulu:audio-play", handleExternalPlay);
      window.removeEventListener("lulu:audio-pause", handleExternalPause);
      window.removeEventListener("lulu:audio-next", handleExternalNext);
    };
  });

  const seek = (event) => {
    const nextTime = Number(event.target.value);
    if (!audioRef.current) return;
    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <aside
      ref={playerRef}
      className={`music-player ${collapsed ? "is-collapsed" : ""}`}
      aria-label="背景音乐播放器"
    >
      <div className={`player-playlist ${playlistOpen ? "is-open" : ""}`}>
        <div className="playlist-heading">
          <span>BACKGROUND PLAYLIST</span>
          <strong>{musicTracks.length} TRACKS</strong>
        </div>
        <div className="playlist-scroll">
          {hasTracks ? musicTracks.map((track, index) => (
            <button
              type="button"
              key={track.id}
              className={index === trackIndex ? "is-active" : ""}
              onClick={() => selectTrack(index)}
              aria-label={`播放 ${track.title}`}
            >
              <span>{track.number}</span>
              <strong>{track.title}</strong>
              {index === trackIndex && (playing ? <Pause size={13} /> : <Play size={13} />)}
            </button>
          )) : (
            <p>把音乐放入 src/assets/music 后会显示在这里。</p>
          )}
        </div>
      </div>

      {activeTrack && (
        <audio
          ref={audioRef}
          src={activeTrack.source}
          preload="metadata"
          loop={musicTracks.length === 1}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={handleEnded}
        />
      )}

      <div className="player-collapsed-controls">
        <button
          type="button"
          className="player-mini-toggle"
          onClick={togglePlayback}
          disabled={!hasTracks}
          aria-label={playing ? "暂停背景音乐" : "播放背景音乐"}
        >
          <span className={`player-art ${playing ? "is-playing" : ""}`}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </span>
        </button>
        <button
          type="button"
          className="player-expand"
          onClick={() => setCollapsed(false)}
          aria-label="展开完整播放器"
        >
          <Maximize2 size={12} />
        </button>
      </div>

      <div className={`player-art ${playing ? "is-playing" : ""}`} aria-hidden="true">
        <Music2 size={15} />
      </div>

      <div className="player-main">
        <div className="player-heading">
          <span>{hasTracks ? activeTrack.number : "LO"}</span>
          <strong>{hasTracks ? activeTrack.title : "等待放入音乐"}</strong>
        </div>
        <div className="player-timeline">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={seek}
            disabled={!hasTracks}
            aria-label="音乐播放进度"
            style={{ "--player-progress": `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-controls">
        <button type="button" className="player-skip" onClick={() => changeTrack(-1)} disabled={!hasTracks} aria-label="上一首">
          <SkipBack size={14} />
        </button>
        <button
          type="button"
          className="player-toggle"
          onClick={togglePlayback}
          disabled={!hasTracks}
          aria-label={playing ? "暂停背景音乐" : "播放背景音乐"}
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button type="button" className="player-skip" onClick={() => changeTrack(1)} disabled={!hasTracks} aria-label="下一首">
          <SkipForward size={14} />
        </button>
        <button
          type="button"
          className="player-tool"
          onClick={() => {
            setPlaylistOpen((value) => !value);
            setVolumeOpen(false);
          }}
          aria-label={playlistOpen ? "收起播放列表" : "查看播放列表"}
          aria-expanded={playlistOpen}
        >
          <ListMusic size={17} />
        </button>
        <div className="player-volume-wrap">
          <button
            type="button"
            className="player-tool player-volume-button"
            onClick={() => {
              setVolumeOpen((value) => !value);
              setPlaylistOpen(false);
            }}
            aria-label="调节背景音乐音量"
            aria-expanded={volumeOpen}
          >
            {volume > 0.45 ? <Volume2 size={18} /> : <Volume1 size={18} />}
          </button>
          <label className={`player-volume ${volumeOpen ? "is-open" : ""}`}>
            <output>{Math.round(volume * 100)}</output>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="背景音乐音量"
            />
            <span>VOL</span>
          </label>
        </div>
        <button
          type="button"
          className="player-tool player-collapse"
          onClick={() => {
            setPlaylistOpen(false);
            setVolumeOpen(false);
            setCollapsed(true);
          }}
          aria-label="收起音乐播放器"
        >
          <Minimize2 size={16} />
        </button>
      </div>
    </aside>
  );
};

export default MusicPlayer;
