import { Copy, DoorOpen, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getRoom, leaveRoom } from "../api/rooms";
import { getContentById } from "../data/catalog";
import { useWatchSocket } from "../hooks/useWatchSocket";
import ChatPanel from "./ChatPanel";
import ConnectionPill from "./ConnectionPill";
import ParticipantsPanel from "./ParticipantsPanel";
import PlayerPanel from "./PlayerPanel";

export default function RoomShell({ session, initialSync, onLeave }) {
  const [room, setRoom] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loadingRoom, setLoadingRoom] = useState(true);
  const handledSystemEventRef = useRef("");
  const socket = useWatchSocket(session.roomId);
  const content = room ? getContentById(room.movieId) : null;

  const user = useMemo(() => ({
    userId: session.userId,
    userName: session.userName
  }), [session.userId, session.userName]);

  const loadRoom = useCallback(async () => {
    setLoadingRoom(true);
    setError("");
    try {
      const data = await getRoom(session.roomId);
      setRoom(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRoom(false);
    }
  }, [session.roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    const latest = socket.systemEvents[0];
    if (!latest) {
      return;
    }

    const eventKey = `${latest.action}-${latest.timestamp}`;
    if (handledSystemEventRef.current === eventKey) {
      return;
    }
    handledSystemEventRef.current = eventKey;

    if (latest.action === "HOST_CHANGED") {
      setNotice(`${latest.hostName} is now host`);
      setRoom((current) => {
        if (!current || current.hostId === latest.hostId) {
          return current;
        }
        return { ...current, hostId: latest.hostId, hostName: latest.hostName };
      });
    }
  }, [socket.systemEvents]);

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(session.roomId);
    setNotice("Room code copied");
  };

  const handleLeave = async () => {
    setError("");
    try {
      await leaveRoom(session.roomId, session.userId);
      onLeave();
    } catch (err) {
      setError(err.message);
    }
  };

  const sendPlayback = (payload) => socket.sendPlayback(payload);
  const sendChat = (payload) => socket.sendChat(payload);
  const sendReaction = (emoji) => socket.sendReaction({
    roomId: session.roomId,
    userId: session.userId,
    emoji
  });

  return (
    <main className="room-layout">
      <header className="room-header">
        <div>
          <span className="eyebrow">Watch room</span>
          <h1>{session.roomId}</h1>
        </div>
        <div className="header-actions">
          <ConnectionPill status={socket.status} />
          <button className="icon-button" type="button" onClick={copyRoomCode} title="Copy room code">
            <Copy size={18} aria-hidden="true" />
          </button>
          <button className="icon-button" type="button" onClick={loadRoom} title="Refresh room">
            <RefreshCw size={18} aria-hidden="true" />
          </button>
          <button className="secondary-action leave-button" type="button" onClick={handleLeave}>
            <DoorOpen size={17} aria-hidden="true" />
            Leave
          </button>
        </div>
      </header>

      {(notice || error || socket.errors[0]) && (
        <div className={`banner ${error || socket.errors[0] ? "error" : ""}`}>
          {error || socket.errors[0] || notice}
        </div>
      )}

      <div className="room-grid">
        <div className="main-column">
          {room && (
            <PlayerPanel
              room={room}
              content={content}
              userId={session.userId}
              initialSync={initialSync}
              lastPlayback={socket.lastPlayback}
              reactions={socket.reactions}
              onPlayback={sendPlayback}
              onReact={sendReaction}
            />
          )}
        </div>

        <aside className="side-column">
          {loadingRoom && <section className="panel empty-state">Loading room</section>}
          {room && <ParticipantsPanel room={room} currentUserId={session.userId} />}
          <ChatPanel messages={socket.chatMessages} user={user} roomId={session.roomId} onSend={sendChat} />
        </aside>
      </div>
    </main>
  );
}
