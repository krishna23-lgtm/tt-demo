import { Copy, DoorOpen, Eye, EyeOff, Link as LinkIcon, Mail, MessageCircle, RefreshCw, Share2, Users, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  leaveRoom,
  listenChat,
  listenPlayback,
  listenReactions,
  listenRoom,
  markPresence,
  sendChat,
  sendPlayback,
  sendReaction
} from "../firebase/watchPartyService";
import ChatPanel from "../components/ChatPanel";
import LoadingState from "../components/LoadingState";
import ParticipantPanel from "../components/ParticipantPanel";
import VideoPlayer from "../components/VideoPlayer";
import { getContentById } from "../data/catalog";

const REACTION_VISIBLE_MS = 3000;
const CHAT_TOAST_VISIBLE_MS = 2000;
const HOST_TOAST_VISIBLE_MS = 3200;
const REACTION_EMOJIS = ["❤️", "😂", "🔥", "👍"];

export default function RoomPage({ session, initialSync, onLeave }) {
  const user = useMemo(() => ({ uid: session.uid, displayName: session.userName }), [session.uid, session.userName]);
  const [room, setRoom] = useState(null);
  const [playback, setPlayback] = useState(initialSync);
  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [error, setError] = useState("");
  const [visiblePanels, setVisiblePanels] = useState({ participants: true });
  const [chatOpen, setChatOpen] = useState(false);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const [chatPreview, setChatPreview] = useState(null);
  const [copyToast, setCopyToast] = useState("");
  const [hostChangeToast, setHostChangeToast] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [wideLayout, setWideLayout] = useState(() => (
    typeof window !== "undefined" && window.matchMedia("(min-width: 1061px)").matches
  ));
  const knownMessageIdsRef = useRef(new Set());
  const messageTrackerReadyRef = useRef(false);
  const chatToastTimerRef = useRef(null);
  const chatToastTimerMessageIdRef = useRef(null);
  const copyToastTimerRef = useRef(null);
  const hostToastTimerRef = useRef(null);
  const title = room ? getContentById(room.movieId) : null;
  const inviteUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/watchTogether/join/${session.roomId}`;
  }, [session.roomId]);
  const inviteTitle = "Xstream Play Watch Room";
  const inviteText = "Join this Xstream Play watch room.";
  const inviteMessage = `${inviteText}\n${inviteUrl}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`;
  const smsShareUrl = `sms:?&body=${encodeURIComponent(inviteMessage)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(inviteTitle)}&body=${encodeURIComponent(inviteMessage)}`;
  const canUseNativeShare = typeof navigator !== "undefined" && Boolean(navigator.share);
  const visibleReactions = useMemo(() => {
    const seen = new Set();
    return reactions.filter((reaction) => {
      if (seen.has(reaction.id)) {
        return false;
      }
      seen.add(reaction.id);
      return true;
    });
  }, [reactions]);

  useEffect(() => {
    const reactionTimers = [];
    markPresence(session.roomId, user).catch((err) => setError(err.message));
    const unsubscribers = [
      listenRoom(session.roomId, setRoom),
      listenPlayback(session.roomId, setPlayback),
      listenChat(session.roomId, setMessages),
      listenReactions(session.roomId, (reaction) => setReactions((current) => {
        if (current.some((item) => item.id === reaction.id)) {
          return current;
        }
        if (reaction.emoji === "HOST_CHANGED") {
          const nextHostName = reaction.userName || "New host";
          setHostChangeToast(`Now ${nextHostName} is the host`);
          if (hostToastTimerRef.current) {
            window.clearTimeout(hostToastTimerRef.current);
          }
          hostToastTimerRef.current = window.setTimeout(() => {
            setHostChangeToast("");
            hostToastTimerRef.current = null;
          }, HOST_TOAST_VISIBLE_MS);
        }
        const timeoutId = window.setTimeout(() => {
          setReactions((items) => items.filter((item) => item.id !== reaction.id));
        }, REACTION_VISIBLE_MS);
        reactionTimers.push(timeoutId);
        return [{ ...reaction, receivedAt: Date.now() }, ...current].slice(0, 12);
      }))
    ];
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      reactionTimers.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [session.roomId, user]);

  useEffect(() => {
    knownMessageIdsRef.current = new Set();
    messageTrackerReadyRef.current = false;
    setHasUnreadChat(false);
    setChatPreview(null);
    setHostChangeToast("");
    if (chatToastTimerRef.current) {
      window.clearTimeout(chatToastTimerRef.current);
      chatToastTimerRef.current = null;
    }
    if (hostToastTimerRef.current) {
      window.clearTimeout(hostToastTimerRef.current);
      hostToastTimerRef.current = null;
    }
    chatToastTimerMessageIdRef.current = null;
  }, [session.roomId]);

  useEffect(() => () => {
    if (chatToastTimerRef.current) {
      window.clearTimeout(chatToastTimerRef.current);
    }
    if (copyToastTimerRef.current) {
      window.clearTimeout(copyToastTimerRef.current);
    }
    if (hostToastTimerRef.current) {
      window.clearTimeout(hostToastTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const currentIds = new Set(messages.map((message) => message.id).filter(Boolean));
    const showChatPreview = (message) => {
      setHasUnreadChat(true);
      setChatPreview(message);
      if (chatToastTimerRef.current) {
        window.clearTimeout(chatToastTimerRef.current);
        chatToastTimerRef.current = null;
      }
      if (!room) {
        chatToastTimerMessageIdRef.current = null;
        return;
      }
      chatToastTimerMessageIdRef.current = message.id;
      chatToastTimerRef.current = window.setTimeout(() => {
        setChatPreview(null);
        chatToastTimerRef.current = null;
        chatToastTimerMessageIdRef.current = null;
      }, CHAT_TOAST_VISIBLE_MS);
    };

    if (!messageTrackerReadyRef.current) {
      const latestMessageFromOthers = [...messages].reverse().find((message) => message.id && message.userId !== session.uid);
      knownMessageIdsRef.current = currentIds;
      messageTrackerReadyRef.current = true;
      if (!chatOpen && latestMessageFromOthers) {
        showChatPreview(latestMessageFromOthers);
      }
      return;
    }

    const incomingMessages = messages.filter((message) => message.id && !knownMessageIdsRef.current.has(message.id));
    if (chatOpen) {
      setHasUnreadChat(false);
      setChatPreview(null);
      if (chatToastTimerRef.current) {
        window.clearTimeout(chatToastTimerRef.current);
        chatToastTimerRef.current = null;
      }
    } else if (incomingMessages.some((message) => message.userId !== session.uid)) {
      const incomingFromOthers = incomingMessages.filter((message) => message.userId !== session.uid);
      const latestIncoming = incomingFromOthers[incomingFromOthers.length - 1];
      showChatPreview(latestIncoming);
    }
    knownMessageIdsRef.current = currentIds;
  }, [chatOpen, messages, room, session.uid]);

  useEffect(() => {
    if (!room || chatOpen || !chatPreview || chatToastTimerRef.current || chatToastTimerMessageIdRef.current === chatPreview.id) {
      return;
    }
    chatToastTimerMessageIdRef.current = chatPreview.id;
    chatToastTimerRef.current = window.setTimeout(() => {
      setChatPreview(null);
      chatToastTimerRef.current = null;
      chatToastTimerMessageIdRef.current = null;
    }, CHAT_TOAST_VISIBLE_MS);
  }, [chatOpen, chatPreview, room]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1061px)");
    const updateLayout = () => setWideLayout(media.matches);
    updateLayout();
    media.addEventListener("change", updateLayout);
    return () => media.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    if (!leaveConfirmOpen) {
      return undefined;
    }
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !leaving) {
        setLeaveConfirmOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [leaveConfirmOpen, leaving]);

  useEffect(() => {
    if (!inviteOpen) {
      return undefined;
    }
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setInviteOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [inviteOpen]);

  const showRoomToast = (message) => {
    setCopyToast(message);
    if (copyToastTimerRef.current) {
      window.clearTimeout(copyToastTimerRef.current);
    }
    copyToastTimerRef.current = window.setTimeout(() => {
      setCopyToast("");
      copyToastTimerRef.current = null;
    }, 2200);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(session.roomId);
      showRoomToast(`Room code ${session.roomId} copied`);
    } catch {
      showRoomToast("Could not copy room code");
    }
  };

  const shareInvite = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: inviteTitle,
          text: inviteText,
          url: inviteUrl
        });
        setInviteOpen(false);
        return;
      }
      await copyInviteLink();
    } catch (err) {
      if (err.name !== "AbortError") {
        showRoomToast("Could not share invite");
      }
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setInviteOpen(false);
      showRoomToast("Invite link copied");
    } catch {
      showRoomToast("Could not copy invite");
    }
  };

  const requestLeave = () => {
    setLeaveConfirmOpen(true);
  };

  const stayInRoom = () => {
    setLeaveConfirmOpen(false);
  };

  const confirmLeave = async () => {
    setLeaving(true);
    try {
      await leaveRoom(session.roomId, user);
      onLeave();
    } catch (err) {
      setError(err.message);
      setLeaving(false);
      setLeaveConfirmOpen(false);
    }
  };

  const togglePanel = (panel) => {
    setVisiblePanels((current) => ({ ...current, [panel]: !current[panel] }));
  };

  const openChatFromPreview = () => {
    setChatOpen(true);
    setChatPreview(null);
    setHasUnreadChat(false);
    if (chatToastTimerRef.current) {
      window.clearTimeout(chatToastTimerRef.current);
      chatToastTimerRef.current = null;
    }
  };

  if (!room) {
    return (
      <main className="room-layout">
        <LoadingState title="Preparing your watch room" message="Connecting video, chat, reactions, and participants." />
      </main>
    );
  }

  return (
    <main className="room-layout">
      <header className="room-header">
        <div>
          <span className="eyebrow">{title?.provider || "Live room"}</span>
          <h1>{session.roomId}</h1>
          {title && <p>{title.title} · {title.rating} · {title.durationLabel}</p>}
        </div>
        <div className="header-actions">
          <span className="connection-pill online">Live room</span>
          <button className="secondary-action invite-action" type="button" onClick={() => setInviteOpen(true)}>
            <Share2 size={17} aria-hidden="true" />
            Invite
          </button>
          <button className="icon-button" type="button" onClick={copy} title="Copy room code">
            <Copy size={18} aria-hidden="true" />
          </button>
          <button className="icon-button" type="button" onClick={() => window.location.reload()} title="Refresh">
            <RefreshCw size={18} aria-hidden="true" />
          </button>
          <button className="secondary-action danger-action" type="button" onClick={requestLeave}>
            <DoorOpen size={17} aria-hidden="true" />
            Leave
          </button>
        </div>
      </header>

      {error && <div className="banner error">{error}</div>}
      {copyToast && <div className="room-copy-toast" role="status">{copyToast}</div>}
      {hostChangeToast && (
        <div className="host-change-toast" role="status">
          <span>Host changed</span>
          <strong>{hostChangeToast}</strong>
        </div>
      )}

      {inviteOpen && (
        <div className="invite-backdrop" role="presentation" onMouseDown={() => setInviteOpen(false)}>
          <section className="invite-sheet" role="dialog" aria-modal="true" aria-labelledby="invite-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="invite-sheet-heading">
              <div>
                <span className="eyebrow">Invite</span>
                <h2 id="invite-title">Share watch room</h2>
                <p>Friends open the link, enter their name, and join this room.</p>
              </div>
              <button className="icon-button invite-close-button" type="button" onClick={() => setInviteOpen(false)} title="Close invite">
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <div className="invite-link-preview">{inviteUrl}</div>
            <div className="invite-options">
              {canUseNativeShare && (
                <button className="invite-option" type="button" onClick={shareInvite}>
                  <Share2 size={17} aria-hidden="true" />
                  Apps
                </button>
              )}
              <a className="invite-option" href={whatsappShareUrl} target="_blank" rel="noreferrer" onClick={() => setInviteOpen(false)}>
                <MessageCircle size={17} aria-hidden="true" />
                WhatsApp
              </a>
              <a className="invite-option" href={smsShareUrl} onClick={() => setInviteOpen(false)}>
                <MessageCircle size={17} aria-hidden="true" />
                SMS
              </a>
              <a className="invite-option" href={emailShareUrl} onClick={() => setInviteOpen(false)}>
                <Mail size={17} aria-hidden="true" />
                Email
              </a>
              <button className="invite-option" type="button" onClick={copyInviteLink}>
                <LinkIcon size={17} aria-hidden="true" />
                Copy Link
              </button>
            </div>
          </section>
        </div>
      )}

      {leaveConfirmOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={stayInRoom}>
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="leave-room-title" onMouseDown={(event) => event.stopPropagation()}>
            <span className="confirm-icon">
              <DoorOpen size={22} aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow">Leave room</span>
              <h2 id="leave-room-title">Do you want to leave this watch room?</h2>
              <p>Your video, chat, and reactions will close on this device. Other participants can continue watching.</p>
            </div>
            <div className="confirm-actions">
              <button className="secondary-action stay-action" type="button" onClick={stayInRoom} disabled={leaving}>
                Stay
              </button>
              <button className="secondary-action danger-action confirm-leave-action" type="button" onClick={confirmLeave} disabled={leaving}>
                <DoorOpen size={17} aria-hidden="true" />
                {leaving ? "Leaving" : "Leave"}
              </button>
            </div>
          </section>
        </div>
      )}

      <div className={`room-grid ${chatOpen && wideLayout ? "chat-dock-open" : ""}`}>
        <div className="main-column">
          <div className={`watch-stage ${chatOpen && wideLayout ? "chat-dock-open" : ""}`}>
            <div className="watch-video-stack">
              <VideoPlayer
                room={room}
                playback={playback}
                user={user}
                initialSync={initialSync}
                reactions={visibleReactions}
                chatMessages={messages}
                chatOpen={chatOpen}
                hasUnreadChat={hasUnreadChat}
                chatPreview={chatPreview}
                chatMode={wideLayout ? "dock" : "overlay"}
                onToggleChat={() => setChatOpen((current) => !current)}
                onChatPreviewClick={openChatFromPreview}
                onChatSend={(message) => sendChat(session.roomId, user, message)}
                onPlayback={(action, currentTime) => sendPlayback(session.roomId, user, action, currentTime, room.hostId)}
              />
              <div className="reaction-zone">
                {REACTION_EMOJIS.map((emoji) => (
                  <button className="icon-button reaction-button" type="button" key={emoji} onClick={() => sendReaction(session.roomId, user, emoji)} title={emoji}>
                    <span>{emoji}</span>
                  </button>
                ))}
              </div>
            </div>
            {chatOpen && wideLayout && (
              <aside className="chat-dock" aria-label="Live chat">
                <ChatPanel
                  messages={messages}
                  uid={session.uid}
                  onSend={(message) => sendChat(session.roomId, user, message)}
                  variant="dock"
                  onClose={() => setChatOpen(false)}
                />
              </aside>
            )}
          </div>
        </div>
        <aside className="side-column">
          <div className="side-controls" aria-label="Room panels">
            <button
              className={`panel-toggle ${visiblePanels.participants ? "active" : ""}`}
              type="button"
              aria-pressed={visiblePanels.participants}
              onClick={() => togglePanel("participants")}
            >
              <Users size={16} aria-hidden="true" />
              {visiblePanels.participants ? "Hide Participants" : "View Participants"}
              {visiblePanels.participants ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
          {visiblePanels.participants && <ParticipantPanel room={room} uid={session.uid} />}
          {!visiblePanels.participants && (
            <section className="panel empty-panel">
              <span>Participants hidden</span>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
