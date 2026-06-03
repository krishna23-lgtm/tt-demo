import { Pause, Play, RefreshCw, SkipForward, Volume2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clampTime, formatClock } from "../utils/time";
import ReactionBar from "./ReactionBar";

export default function PlayerPanel({
  room,
  content,
  userId,
  initialSync,
  lastPlayback,
  reactions,
  onPlayback,
  onReact
}) {
  const videoRef = useRef(null);
  const applyingRemoteRef = useRef(false);
  const currentTimeRef = useRef(initialSync?.currentTime || room?.currentTime || 0);
  const [currentTime, setCurrentTime] = useState(initialSync?.currentTime || room?.currentTime || 0);
  const [playing, setPlaying] = useState(Boolean(initialSync?.playing || room?.playing));
  const [duration, setDuration] = useState(content?.durationSeconds || 1);
  const [videoReady, setVideoReady] = useState(false);
  const isHost = room.hostId === userId;

  const progress = useMemo(() => `${Math.min((currentTime / Math.max(duration, 1)) * 100, 100)}%`, [currentTime, duration]);

  const roomCurrentTime = room?.currentTime ?? 0;
  const roomPlaying = Boolean(room?.playing);
  const initialCurrentTime = initialSync?.currentTime;
  const initialPlaying = initialSync?.playing;

  const publish = useCallback((action, time = videoRef.current?.currentTime ?? currentTimeRef.current) => {
    onPlayback({
      roomId: room.roomId,
      userId,
      action,
      currentTime: Number(time)
    });
  }, [onPlayback, room.roomId, userId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const nextTime = clampTime(initialCurrentTime ?? roomCurrentTime, duration);
    if (Math.abs(video.currentTime - nextTime) > 0.45) {
      video.currentTime = nextTime;
    }
    currentTimeRef.current = nextTime;
    setCurrentTime((previous) => (Math.abs(previous - nextTime) > 0.1 ? nextTime : previous));
    setPlaying(Boolean(initialPlaying ?? roomPlaying));
  }, [content?.id, duration, initialCurrentTime, initialPlaying, roomCurrentTime, roomPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !lastPlayback) {
      return;
    }

    applyingRemoteRef.current = true;
    const nextTime = clampTime(lastPlayback.currentTime, duration);
    if (Math.abs(video.currentTime - nextTime) > 0.45) {
      video.currentTime = nextTime;
    }
    currentTimeRef.current = nextTime;
    setCurrentTime(nextTime);
    setPlaying(Boolean(lastPlayback.playing));

    if (lastPlayback.playing) {
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }

    window.setTimeout(() => {
      applyingRemoteRef.current = false;
    }, 250);
  }, [duration, lastPlayback]);

  useEffect(() => {
    if (!playing || !isHost) {
      return undefined;
    }

    const syncTimer = window.setInterval(() => {
      const video = videoRef.current;
      if (video) {
        publish("SYNC", video.currentTime);
      }
    }, 5000);

    return () => window.clearInterval(syncTimer);
  }, [isHost, playing, publish]);

  const playVideo = async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    setPlaying(true);
    publish("PLAY", video.currentTime);
    await video.play();
  };

  const pauseVideo = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.pause();
    setPlaying(false);
    publish("PAUSE", video.currentTime);
  };

  const togglePlay = () => {
    if (playing) {
      pauseVideo();
      return;
    }
    playVideo().catch(() => undefined);
  };

  const seek = (event) => {
    const nextTime = clampTime(event.target.value, duration);
    currentTimeRef.current = nextTime;
    setCurrentTime(nextTime);
    if (videoRef.current && videoRef.current.readyState > 0) {
      try {
        videoRef.current.currentTime = nextTime;
      } catch {
        // The room state still updates; the media element catches up after metadata loads.
      }
    }
  };

  const commitSeek = () => {
    publish("SEEK", currentTime);
  };

  const jumpAhead = () => {
    const video = videoRef.current;
    const nextTime = clampTime(currentTimeRef.current + 30, duration);
    currentTimeRef.current = nextTime;
    setCurrentTime(nextTime);
    if (video && video.readyState > 0) {
      try {
        video.currentTime = nextTime;
      } catch {
        // The room state still updates; the media element catches up after metadata loads.
      }
    }
    publish("SEEK", nextTime);
  };

  const updateDuration = () => {
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration)) {
      setDuration(video.duration);
      setVideoReady(true);
    }
  };

  const updateTime = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    currentTimeRef.current = video.currentTime;
    setCurrentTime(video.currentTime);
  };

  const handleNativePause = () => {
    if (!applyingRemoteRef.current) {
      setPlaying(false);
    }
  };

  const handleNativePlay = () => {
    if (!applyingRemoteRef.current) {
      setPlaying(true);
    }
  };

  return (
    <section className="player-panel">
      <div className="screen video-screen" style={{ "--progress": progress }}>
        <video
          ref={videoRef}
          src={content.videoUrl}
          poster={content.posterUrl}
          preload="metadata"
          playsInline
          onLoadedMetadata={updateDuration}
          onTimeUpdate={updateTime}
          onPause={handleNativePause}
          onPlay={handleNativePlay}
        />
        <div className="screen-topline">
          <span>{content.title}</span>
          <span>{playing ? "Playing" : "Paused"}</span>
        </div>
        <div className={`video-center ${videoReady ? "ready" : ""}`}>
          <span className="movie-mark">TT</span>
          <strong>{formatClock(currentTime)}</strong>
        </div>
        <div className="screen-progress" />
      </div>

      <div className="content-strip">
        <div>
          <h2>{content.title}</h2>
          <p>{content.type} · {content.year} · {content.rating} · {content.durationLabel}</p>
        </div>
        <span className="audio-chip">
          <Volume2 size={16} aria-hidden="true" />
          Audio follows room sync
        </span>
      </div>

      <div className="transport">
        <button className="icon-button control-button" type="button" onClick={togglePlay} title={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={22} aria-hidden="true" /> : <Play size={22} aria-hidden="true" />}
        </button>

        <button className="icon-button control-button" type="button" onClick={jumpAhead} title="Jump ahead">
          <SkipForward size={21} aria-hidden="true" />
        </button>

        <div className="timeline">
          <span>{formatClock(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.5"
            value={currentTime}
            onChange={seek}
            onMouseUp={commitSeek}
            onTouchEnd={commitSeek}
            aria-label="Playback position"
          />
          <span>{formatClock(duration)}</span>
        </div>

        <button className="secondary-action sync-button" type="button" onClick={() => publish("SYNC")} title="Sync room">
          <RefreshCw size={17} aria-hidden="true" />
          Sync
        </button>
      </div>

      <ReactionBar onReact={onReact} floatingReactions={reactions} />
    </section>
  );
}
