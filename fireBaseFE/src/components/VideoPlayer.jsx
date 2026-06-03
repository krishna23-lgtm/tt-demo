import { Maximize2, MessageCircle, Minimize2, Pause, Play, RefreshCw, Rewind, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatPanel from "./ChatPanel";
import { getContentById } from "../data/catalog";
import { clampTime, formatClock } from "../utils/time";

const CHROME_HIDE_DELAY_MS = 1000;

export default function VideoPlayer({
  room,
  playback,
  user,
  initialSync,
  reactions = [],
  chatMessages = [],
  chatOpen = false,
  hasUnreadChat = false,
  chatPreview = null,
  chatMode = "overlay",
  onChatSend,
  onToggleChat,
  onChatPreviewClick,
  onPlayback
}) {
  const content = getContentById(room.movieId);
  const screenRef = useRef(null);
  const videoRef = useRef(null);
  const timeRef = useRef(initialSync?.currentTime || playback?.currentTime || 0);
  const chromeTimerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(timeRef.current);
  const [duration, setDuration] = useState(content.durationSeconds);
  const [playing, setPlaying] = useState(Boolean(initialSync?.playing || playback?.playing));
  const [fullscreen, setFullscreen] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const progress = `${Math.min((currentTime / Math.max(duration, 1)) * 100, 100)}%`;
  const isHost = room.hostId === user.uid;
  const showFullscreenChatDock = chatOpen && onChatSend && fullscreen && chatMode === "dock";
  const showOverlayChat = chatOpen && onChatSend && !showFullscreenChatDock && chatMode === "overlay";
  const showChrome = chromeVisible || chatOpen || autoplayBlocked;
  const hostControlledTitle = "Host controlled";

  const playbackTargetTime = useCallback(() => {
    if (!playback) {
      return timeRef.current;
    }
    const baseTime = Number(playback.baseCurrentTime ?? playback.currentTime ?? 0);
    if (!playback.playing || !playback.updatedAt) {
      return clampTime(baseTime, duration);
    }
    const elapsedSeconds = Math.max(0, (Date.now() - Number(playback.updatedAt)) / 1000);
    return clampTime(baseTime + elapsedSeconds, duration);
  }, [duration, playback]);

  const stopLocalPlayback = useCallback((updateState = true) => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    if (updateState) {
      setPlaying(false);
      setAutoplayBlocked(false);
    }
  }, []);

  const publish = useCallback((action, time = timeRef.current) => {
    if (isHost) {
      onPlayback(action, Number(time));
    }
  }, [isHost, onPlayback]);

  const clearChromeTimer = useCallback(() => {
    if (chromeTimerRef.current) {
      window.clearTimeout(chromeTimerRef.current);
      chromeTimerRef.current = null;
    }
  }, []);

  const revealChrome = useCallback(() => {
    clearChromeTimer();
    setChromeVisible(true);
  }, [clearChromeTimer]);

  const hideChromeAfterDelay = useCallback(() => {
    clearChromeTimer();
    if (!playing || chatOpen || autoplayBlocked) {
      return;
    }
    chromeTimerRef.current = window.setTimeout(() => {
      setChromeVisible(false);
      chromeTimerRef.current = null;
    }, CHROME_HIDE_DELAY_MS);
  }, [autoplayBlocked, chatOpen, clearChromeTimer, playing]);

  const revealChromeTemporarily = useCallback(() => {
    revealChrome();
    if (playing && !chatOpen && !autoplayBlocked) {
      chromeTimerRef.current = window.setTimeout(() => {
        setChromeVisible(false);
        chromeTimerRef.current = null;
      }, CHROME_HIDE_DELAY_MS);
    }
  }, [autoplayBlocked, chatOpen, playing, revealChrome]);

  const syncViewerToRoom = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !playback) {
      return;
    }

    const nextTime = playbackTargetTime();
    timeRef.current = nextTime;
    setCurrentTime(nextTime);

    if (Math.abs(video.currentTime - nextTime) > 0.35) {
      video.currentTime = nextTime;
    }

    if (playback.playing) {
      try {
        await video.play();
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
    } else {
      video.pause();
      setAutoplayBlocked(false);
    }
  }, [playback, playbackTargetTime]);

  useEffect(() => {
    if (!playback) {
      return;
    }
    const video = videoRef.current;
    const nextTime = playbackTargetTime();
    timeRef.current = nextTime;
    setCurrentTime(nextTime);
    setPlaying(Boolean(playback.playing));

    if (video && Math.abs(video.currentTime - nextTime) > 0.5) {
      try {
        video.currentTime = nextTime;
      } catch {
        // Metadata may still be loading; state remains synced and video catches up later.
      }
    }

    if (video && playback.playing) {
      video.play()
        .then(() => setAutoplayBlocked(false))
        .catch(() => {
          if (!isHost) {
            setAutoplayBlocked(true);
          }
        });
    } else if (video) {
      video.pause();
      setAutoplayBlocked(false);
    }
  }, [isHost, playback, playbackTargetTime]);

  useEffect(() => {
    const pauseBeforePageLeaves = () => stopLocalPlayback(false);

    window.addEventListener("pagehide", pauseBeforePageLeaves);
    window.addEventListener("beforeunload", pauseBeforePageLeaves);

    return () => {
      stopLocalPlayback(false);
      window.removeEventListener("pagehide", pauseBeforePageLeaves);
      window.removeEventListener("beforeunload", pauseBeforePageLeaves);
    };
  }, [stopLocalPlayback]);

  useEffect(() => () => clearChromeTimer(), [clearChromeTimer]);

  useEffect(() => {
    if (!playing || chatOpen || autoplayBlocked) {
      revealChrome();
      return;
    }
    hideChromeAfterDelay();
  }, [autoplayBlocked, chatOpen, hideChromeAfterDelay, playing, revealChrome]);

  useEffect(() => {
    if (!playing || room.hostId !== user.uid) {
      return undefined;
    }
    const timer = window.setInterval(() => publish("SYNC", videoRef.current?.currentTime ?? timeRef.current), 2000);
    return () => window.clearInterval(timer);
  }, [playing, publish, room.hostId, user.uid]);

  useEffect(() => {
    const updateFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  useEffect(() => {
    const exitFallbackFullscreen = (event) => {
      if (event.key === "Escape" && fullscreen && !document.fullscreenElement) {
        setFullscreen(false);
      }
    };
    window.addEventListener("keydown", exitFallbackFullscreen);
    return () => window.removeEventListener("keydown", exitFallbackFullscreen);
  }, [fullscreen]);

  const play = () => {
    if (!isHost) {
      return;
    }
    const video = videoRef.current;
    setPlaying(true);
    publish("PLAY", video?.currentTime ?? timeRef.current);
    video?.play().catch(() => undefined);
  };

  const pause = () => {
    if (!isHost) {
      return;
    }
    const video = videoRef.current;
    setPlaying(false);
    publish("PAUSE", video?.currentTime ?? timeRef.current);
    video?.pause();
  };

  const togglePlay = () => {
    if (playing) {
      pause();
    } else {
      play();
    }
  };

  const skipBy = (seconds) => {
    if (!isHost) {
      return;
    }
    const nextTime = clampTime(timeRef.current + seconds, duration);
    timeRef.current = nextTime;
    setCurrentTime(nextTime);
    if (videoRef.current?.readyState > 0) {
      videoRef.current.currentTime = nextTime;
    }
    publish("SEEK", nextTime);
  };

  const toggleFullscreen = async () => {
    const screen = screenRef.current;
    const video = videoRef.current;
    try {
      if (fullscreen || document.fullscreenElement) {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        setFullscreen(false);
      } else if (screen?.requestFullscreen) {
        setFullscreen(true);
        await screen.requestFullscreen();
        setFullscreen(true);
      } else if (video?.webkitEnterFullscreen) {
        setFullscreen(true);
        video.webkitEnterFullscreen();
        setFullscreen(true);
      } else {
        setFullscreen(true);
      }
    } catch {
      setFullscreen((current) => current || Boolean(document.fullscreenElement));
    }
  };

  const seek = (event) => {
    const nextTime = clampTime(event.target.value, duration);
    timeRef.current = nextTime;
    setCurrentTime(nextTime);
  };

  const commitSeek = () => {
    if (!isHost) {
      return;
    }
    if (videoRef.current?.readyState > 0) {
      videoRef.current.currentTime = timeRef.current;
    }
    publish("SEEK", timeRef.current);
  };

  return (
    <section className="player-panel">
      <div
        ref={screenRef}
        className={`screen ${fullscreen ? "fullscreen-mode" : ""} ${showFullscreenChatDock ? "fullscreen-chat-open" : ""} ${showChrome ? "chrome-visible" : "chrome-hidden"}`}
        onClick={(event) => {
          revealChromeTemporarily();
          if (isHost) {
            togglePlay(event);
          }
        }}
        onFocus={revealChrome}
        onMouseEnter={revealChromeTemporarily}
        onMouseMove={revealChromeTemporarily}
        onMouseLeave={hideChromeAfterDelay}
        onPointerDown={revealChromeTemporarily}
        onTouchStart={revealChromeTemporarily}
      >
        <video
          ref={videoRef}
          src={content.videoUrl}
          poster={content.posterUrl}
          preload="metadata"
          playsInline
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || content.durationSeconds)}
          onTimeUpdate={() => {
            if (videoRef.current) {
              timeRef.current = videoRef.current.currentTime;
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onEnded={pause}
        />
        <div className="screen-topline">
          <span>{content.provider}</span>
          <span className={playing ? "state-pill playing" : "state-pill"}>{playing ? "Playing" : "Paused"}</span>
        </div>

        {chatPreview && !chatOpen && (
          <button
            className="chat-message-toast screen-message-toast"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChatPreviewClick?.();
            }}
            aria-label={`Open chat message from ${chatPreview.userName || "Guest"}`}
          >
            <span>New message</span>
            <strong>{chatPreview.userName || "Guest"}</strong>
            <p>{chatPreview.message}</p>
          </button>
        )}

        {!playing && (
          <button
            className={`center-play-button ${!isHost ? "host-locked-control" : ""}`}
            type="button"
            disabled={!isHost}
            onClick={(event) => { event.stopPropagation(); play(); }}
            title={isHost ? "Play" : hostControlledTitle}
          >
            <Play size={30} aria-hidden="true" />
          </button>
        )}

        {autoplayBlocked && (
          <button className="viewer-sync-overlay" type="button" onClick={(event) => { event.stopPropagation(); syncViewerToRoom(); }}>
            <Play size={22} aria-hidden="true" />
            Tap to sync audio
          </button>
        )}

        <div className="video-reactions" aria-live="polite">
          {reactions.map((reaction, index) => {
            const systemHostChange = reaction.emoji === "HOST_CHANGED";
            return (
              <span
                className="video-reaction"
                key={reaction.id}
                style={{
                  "--reaction-left": `${18 + ((index * 17) % 62)}%`,
                  "--reaction-delay": `${index * 80}ms`
                }}
              >
                <span className="reaction-emoji">{systemHostChange ? "👑" : reaction.emoji}</span>
                <span className="reaction-name">{systemHostChange ? `${reaction.userName || "New host"}` : reaction.userName || "Guest"}</span>
              </span>
            );
          })}
        </div>

        {showOverlayChat && (
          <div className="screen-chat-overlay">
            <ChatPanel messages={chatMessages} uid={user.uid} onSend={onChatSend} variant="overlay" onClose={onToggleChat} />
          </div>
        )}

        {showFullscreenChatDock && (
          <aside className="fullscreen-chat-dock" aria-label="Fullscreen live chat" onClick={(event) => event.stopPropagation()}>
            <ChatPanel messages={chatMessages} uid={user.uid} onSend={onChatSend} variant="dock" onClose={onToggleChat} />
          </aside>
        )}

        <div className="player-controls" onClick={(event) => { event.stopPropagation(); revealChromeTemporarily(); }}>
          <div className="player-progress-row">
            <span>{formatClock(currentTime)}</span>
            <span className="seek-shell" title={isHost ? "Playback position" : hostControlledTitle}>
              <input
                className={`player-seek ${!isHost ? "host-locked-control" : ""}`}
                type="range"
                min="0"
                max={duration}
                step="0.5"
                value={currentTime}
                style={{ "--progress": progress }}
                disabled={!isHost}
                onChange={seek}
                onMouseUp={commitSeek}
                onTouchEnd={commitSeek}
                aria-label={isHost ? "Playback position" : hostControlledTitle}
              />
            </span>
            <span>{formatClock(duration)}</span>
          </div>

          <div className="player-command-row">
            <div className="player-button-group">
              <button
                className={`icon-button control-button ${!isHost ? "host-locked-control" : ""}`}
                type="button"
                onClick={() => skipBy(-10)}
                title={isHost ? "Back 10 seconds" : hostControlledTitle}
                disabled={!isHost}
              >
                <Rewind size={21} aria-hidden="true" />
              </button>
              <button
                className={`icon-button control-button ${!isHost ? "host-locked-control" : ""}`}
                type="button"
                disabled={!isHost}
                onClick={togglePlay}
                title={isHost ? (playing ? "Pause" : "Play") : hostControlledTitle}
              >
                {playing ? <Pause size={22} aria-hidden="true" /> : <Play size={22} aria-hidden="true" />}
              </button>
              <button
                className={`icon-button control-button ${!isHost ? "host-locked-control" : ""}`}
                type="button"
                onClick={() => skipBy(10)}
                title={isHost ? "Ahead 10 seconds" : hostControlledTitle}
                disabled={!isHost}
              >
                <SkipForward size={21} aria-hidden="true" />
              </button>
              <button className="secondary-action sync-button" type="button" onClick={isHost ? () => publish("SYNC", timeRef.current) : syncViewerToRoom} title={isHost ? "Broadcast sync" : "Sync to host"}>
                <RefreshCw size={17} aria-hidden="true" />
                Sync
              </button>
            </div>

            <div className="player-title">
              <strong>{content.title}</strong>
              <span>{content.rating}</span>
            </div>

            <div className="player-edge-actions">
              {onToggleChat && (
                <button
                  className={`icon-button control-button player-chat-button ${chatOpen ? "active" : ""}`}
                  type="button"
                  onClick={onToggleChat}
                  title={chatOpen ? "Hide chat" : "View chat"}
                >
                  <MessageCircle size={20} aria-hidden="true" />
                  {hasUnreadChat && !chatOpen && <span className="player-chat-unread" aria-label="Unread chat message" />}
                </button>
              )}
              <button className="icon-button control-button" type="button" onClick={toggleFullscreen} title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
                {fullscreen ? <Minimize2 size={21} aria-hidden="true" /> : <Maximize2 size={21} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="content-strip">
        <div>
          <h2>{content.title}</h2>
          <p>{content.provider} · {content.rating} · {content.durationLabel}</p>
        </div>
      </div>
    </section>
  );
}
