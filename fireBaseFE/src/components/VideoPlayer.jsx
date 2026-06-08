import { Maximize2, MessageCircle, Minimize2, Pause, Play, RefreshCw, Rewind, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatPanel from "./ChatPanel";
import { getContentById } from "../data/catalog";
import { clampTime, formatClock } from "../utils/time";

const CHROME_HIDE_DELAY_MS = 1000;
let youtubeApiPromise;

function loadYouTubeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube player is available only in the browser."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === "function") {
          previousReady();
        }
        resolve(window.YT);
      };

      const existingScript = document.querySelector("script[src='https://www.youtube.com/iframe_api']");
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        script.onerror = () => reject(new Error("Could not load YouTube player."));
        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
}

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
  const hasDirectVideo = Boolean(content.videoUrl);
  const hasYouTubeVideo = !hasDirectVideo && Boolean(content.youtubeVideoId);
  const hasPlayableMedia = hasDirectVideo || hasYouTubeVideo;
  const screenRef = useRef(null);
  const videoRef = useRef(null);
  const youtubeContainerRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const timeRef = useRef(initialSync?.currentTime || playback?.currentTime || 0);
  const chromeTimerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(timeRef.current);
  const [duration, setDuration] = useState(content.durationSeconds);
  const [playing, setPlaying] = useState(Boolean(initialSync?.playing || playback?.playing));
  const [fullscreen, setFullscreen] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [youtubeError, setYoutubeError] = useState("");
  const [youtubeLoadingVisible, setYoutubeLoadingVisible] = useState(false);
  const progress = `${Math.min((currentTime / Math.max(duration, 1)) * 100, 100)}%`;
  const isHost = room.hostId === user.uid;
  const showFullscreenChatDock = chatOpen && onChatSend && fullscreen && chatMode === "dock";
  const showOverlayChat = chatOpen && onChatSend && !showFullscreenChatDock && chatMode === "overlay";
  const showChrome = chromeVisible || chatOpen || autoplayBlocked || !hasPlayableMedia;
  const hostControlledTitle = "Host controlled";

  const getMediaTime = useCallback(() => {
    if (hasDirectVideo) {
      return videoRef.current?.currentTime ?? timeRef.current;
    }
    if (hasYouTubeVideo) {
      return youtubePlayerRef.current?.getCurrentTime?.() ?? timeRef.current;
    }
    return timeRef.current;
  }, [hasDirectVideo, hasYouTubeVideo]);

  const getMediaDuration = useCallback(() => {
    if (hasDirectVideo) {
      return videoRef.current?.duration || content.durationSeconds;
    }
    if (hasYouTubeVideo) {
      return youtubePlayerRef.current?.getDuration?.() || content.durationSeconds;
    }
    return content.durationSeconds;
  }, [content.durationSeconds, hasDirectVideo, hasYouTubeVideo]);

  const seekMedia = useCallback((time) => {
    const nextTime = clampTime(time, duration);
    if (hasDirectVideo && videoRef.current?.readyState > 0) {
      videoRef.current.currentTime = nextTime;
    } else if (hasYouTubeVideo) {
      youtubePlayerRef.current?.seekTo?.(nextTime, true);
    }
  }, [duration, hasDirectVideo, hasYouTubeVideo]);

  const playMedia = useCallback(async () => {
    if (hasDirectVideo) {
      await videoRef.current?.play();
      return;
    }
    if (hasYouTubeVideo) {
      youtubePlayerRef.current?.playVideo?.();
    }
  }, [hasDirectVideo, hasYouTubeVideo]);

  const pauseMedia = useCallback(() => {
    if (hasDirectVideo) {
      videoRef.current?.pause();
    } else if (hasYouTubeVideo) {
      youtubePlayerRef.current?.pauseVideo?.();
    }
  }, [hasDirectVideo, hasYouTubeVideo]);

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
    pauseMedia();
    if (updateState) {
      setPlaying(false);
      setAutoplayBlocked(false);
    }
  }, [pauseMedia]);

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
    if (!hasPlayableMedia || !playback) {
      return;
    }

    const nextTime = playbackTargetTime();
    timeRef.current = nextTime;
    setCurrentTime(nextTime);

    if (Math.abs(getMediaTime() - nextTime) > 0.35) {
      seekMedia(nextTime);
    }

    if (playback.playing) {
      try {
        await playMedia();
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
    } else {
      pauseMedia();
      setAutoplayBlocked(false);
    }
  }, [getMediaTime, hasPlayableMedia, pauseMedia, playback, playbackTargetTime, playMedia, seekMedia]);

  useEffect(() => {
    if (!hasYouTubeVideo) {
      setYoutubeReady(false);
      setYoutubeError("");
      return undefined;
    }

    let disposed = false;
    setYoutubeReady(false);
    setYoutubeError("");
    setYoutubeLoadingVisible(true);
    const loadingTimer = window.setTimeout(() => {
      setYoutubeLoadingVisible(false);
    }, 4500);

    loadYouTubeApi()
      .then((YT) => {
        if (disposed || !youtubeContainerRef.current) {
          return;
        }
        youtubePlayerRef.current?.destroy?.();
        youtubePlayerRef.current = new YT.Player(youtubeContainerRef.current, {
          videoId: content.youtubeVideoId,
          playerVars: {
            controls: 1,
            enablejsapi: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              const playerDuration = event.target?.getDuration?.();
              if (playerDuration) {
                setDuration(playerDuration);
              }
              event.target?.seekTo?.(timeRef.current, true);
              setYoutubeReady(true);
              setYoutubeLoadingVisible(false);
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.ENDED) {
                const finishedAt = event.target?.getDuration?.() || content.durationSeconds;
                timeRef.current = finishedAt;
                setCurrentTime(finishedAt);
                setPlaying(false);
              }
            },
            onError: () => {
              setYoutubeError("Trailer could not be loaded.");
              setYoutubeLoadingVisible(false);
            }
          }
        });
      })
      .catch((err) => {
        if (!disposed) {
          setYoutubeError(err.message);
          setYoutubeLoadingVisible(false);
        }
      });

    return () => {
      disposed = true;
      window.clearTimeout(loadingTimer);
      youtubePlayerRef.current?.destroy?.();
      youtubePlayerRef.current = null;
    };
  }, [content.durationSeconds, content.youtubeVideoId, hasYouTubeVideo]);

  useEffect(() => {
    if (!hasPlayableMedia) {
      setPlaying(false);
      setAutoplayBlocked(false);
      return;
    }
    if (!playback) {
      return;
    }

    const nextTime = playbackTargetTime();
    timeRef.current = nextTime;
    setCurrentTime(nextTime);
    setPlaying(Boolean(playback.playing));

    if (hasYouTubeVideo && !youtubeReady) {
      setAutoplayBlocked(false);
      return;
    }

    if (Math.abs(getMediaTime() - nextTime) > 0.5) {
      seekMedia(nextTime);
    }

    if (playback.playing) {
      playMedia()
        .then(() => setAutoplayBlocked(false))
        .catch(() => {
          if (!isHost) {
            setAutoplayBlocked(true);
          }
        });
    } else {
      pauseMedia();
      setAutoplayBlocked(false);
    }
  }, [getMediaTime, hasPlayableMedia, hasYouTubeVideo, isHost, pauseMedia, playback, playbackTargetTime, playMedia, seekMedia, youtubeReady]);

  useEffect(() => {
    if (!hasYouTubeVideo || !youtubeReady) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      const nextTime = getMediaTime();
      const nextDuration = getMediaDuration();
      timeRef.current = nextTime;
      setCurrentTime(nextTime);
      if (nextDuration) {
        setDuration(nextDuration);
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [getMediaDuration, getMediaTime, hasYouTubeVideo, youtubeReady]);

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
    if (!hasPlayableMedia || !playing || chatOpen || autoplayBlocked) {
      revealChrome();
      return;
    }
    hideChromeAfterDelay();
  }, [autoplayBlocked, chatOpen, hasPlayableMedia, hideChromeAfterDelay, playing, revealChrome]);

  useEffect(() => {
    if (!hasPlayableMedia || !playing || room.hostId !== user.uid) {
      return undefined;
    }
    const timer = window.setInterval(() => publish("SYNC", getMediaTime()), 2000);
    return () => window.clearInterval(timer);
  }, [getMediaTime, hasPlayableMedia, playing, publish, room.hostId, user.uid]);

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
    if (!hasPlayableMedia || !isHost) {
      return;
    }
    const nextTime = getMediaTime();
    timeRef.current = nextTime;
    setCurrentTime(nextTime);
    setPlaying(true);
    publish("PLAY", nextTime);
    playMedia().catch(() => undefined);
  };

  const pause = () => {
    if (!hasPlayableMedia || !isHost) {
      return;
    }
    const nextTime = getMediaTime();
    timeRef.current = nextTime;
    setCurrentTime(nextTime);
    setPlaying(false);
    publish("PAUSE", nextTime);
    pauseMedia();
  };

  const togglePlay = () => {
    if (playing) {
      pause();
    } else {
      play();
    }
  };

  const skipBy = (seconds) => {
    if (!hasPlayableMedia || !isHost) {
      return;
    }
    const nextTime = clampTime(timeRef.current + seconds, duration);
    timeRef.current = nextTime;
    setCurrentTime(nextTime);
    seekMedia(nextTime);
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
    if (!hasPlayableMedia) {
      return;
    }
    const nextTime = clampTime(event.target.value, duration);
    timeRef.current = nextTime;
    setCurrentTime(nextTime);
  };

  const commitSeek = () => {
    if (!hasPlayableMedia || !isHost) {
      return;
    }
    seekMedia(timeRef.current);
    publish("SEEK", timeRef.current);
  };

  return (
    <section className="player-panel">
      <div
        ref={screenRef}
        className={`screen ${fullscreen ? "fullscreen-mode" : ""} ${showFullscreenChatDock ? "fullscreen-chat-open" : ""} ${showChrome ? "chrome-visible" : "chrome-hidden"}`}
        onClick={(event) => {
          revealChromeTemporarily();
          if (hasPlayableMedia && isHost) {
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
        {hasDirectVideo && (
          <video
            ref={videoRef}
            src={content.videoUrl}
            poster={content.posterUrl}
            preload="metadata"
            playsInline
            onLoadedMetadata={() => setDuration(getMediaDuration())}
            onTimeUpdate={() => {
              const nextTime = getMediaTime();
              timeRef.current = nextTime;
              setCurrentTime(nextTime);
            }}
            onEnded={pause}
          />
        )}

        {hasYouTubeVideo && (
          <div className="youtube-stage">
            <div className="youtube-player-holder">
              <div ref={youtubeContainerRef} />
            </div>
            {youtubeReady && (
              <button
                className="youtube-click-shield"
                type="button"
                aria-label={playing ? "Pause trailer" : "Play trailer"}
                onClick={(event) => {
                  event.stopPropagation();
                  revealChromeTemporarily();
                  if (isHost) {
                    togglePlay();
                  }
                }}
              />
            )}
            {(youtubeLoadingVisible || youtubeError) && (
              <div className="youtube-loading-card">
                <img src={content.posterUrl} alt="" />
                <strong>{youtubeError || "Loading video"}</strong>
              </div>
            )}
          </div>
        )}

        {!hasPlayableMedia && (
          <div className="trailer-stage" aria-label={`${content.title} trailer or teaser`}>
            <img src={content.posterUrl} alt="" />
            <div className="trailer-stage-copy">
              <span>{content.provider}</span>
              <strong>{content.title}</strong>
              <a
                className="trailer-open-button"
                href={content.trailerSearchUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                <Play size={19} aria-hidden="true" />
                Trailer / teaser
              </a>
            </div>
          </div>
        )}

        <div className="screen-topline">
          <span>{content.provider}</span>
          <span className={playing ? "state-pill playing" : "state-pill"}>{playing ? "Playing" : content.sourceLabel || "Paused"}</span>
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

        {hasPlayableMedia && !playing && (
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

        {hasPlayableMedia && autoplayBlocked && (
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
                <span className={`reaction-emoji ${systemHostChange ? "host-reaction-mark" : ""}`}>{systemHostChange ? "HOST" : reaction.emoji}</span>
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
          {hasPlayableMedia && (
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
          )}

          <div className="player-command-row">
            {hasPlayableMedia ? (
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
                <button className="secondary-action sync-button" type="button" onClick={isHost ? () => publish("SYNC", getMediaTime()) : syncViewerToRoom} title={isHost ? "Broadcast sync" : "Sync to host"}>
                  <RefreshCw size={17} aria-hidden="true" />
                  Sync
                </button>
              </div>
            ) : (
              <div className="player-button-group">
                <a
                  className="secondary-action trailer-control-link"
                  href={content.trailerSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Play size={17} aria-hidden="true" />
                  Trailer
                </a>
              </div>
            )}

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
