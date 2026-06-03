import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { hasFirebaseConfig } from "./firebase/config";
import { ensureAnonymousUser } from "./firebase/authService";
import { createRoom, joinRoom } from "./firebase/watchPartyService";
import BrowsePage from "./pages/BrowsePage";
import JoinPage from "./pages/JoinPage";
import RoomPage from "./pages/RoomPage";
import SetupPage from "./pages/SetupPage";
import { clearSession, readSession, saveSession } from "./utils/session";

const WATCH_BASE = "/watchTogether";
const joinPath = `${WATCH_BASE}/join`;
const roomPath = (roomId) => `${WATCH_BASE}/room/${roomId}`;

export default function App() {
  const navigate = useNavigate();
  const [session, setSession] = useState(readSession);
  const [initialSync, setInitialSync] = useState(null);

  useEffect(() => {
    if (session) {
      saveSession(session);
    } else {
      clearSession();
    }
  }, [session]);

  if (!hasFirebaseConfig) {
    return <SetupPage />;
  }

  const handleCreate = async ({ movieId, userName }) => {
    const user = await ensureAnonymousUser(userName);
    const room = await createRoom({ movieId, user });
    const nextSession = {
      roomId: room.roomId,
      movieId,
      uid: user.uid,
      userName: user.displayName || userName
    };
    setInitialSync({ playing: false, currentTime: 0 });
    setSession(nextSession);
    navigate(roomPath(room.roomId));
  };

  const handleJoin = async ({ roomId, userName }) => {
    const user = await ensureAnonymousUser(userName);
    const sync = await joinRoom({ roomId, user });
    const nextSession = {
      roomId,
      movieId: sync.movieId,
      uid: user.uid,
      userName: user.displayName || userName
    };
    setInitialSync(sync);
    setSession(nextSession);
    navigate(roomPath(roomId));
  };

  const handleLeave = () => {
    setInitialSync(null);
    setSession(null);
    navigate(WATCH_BASE);
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={WATCH_BASE} replace />} />
      <Route path="/browse" element={<Navigate to={WATCH_BASE} replace />} />
      <Route path="/join" element={<Navigate to={joinPath} replace />} />
      <Route path="/room/:roomId" element={<LegacyRoomRedirect />} />
      <Route path={WATCH_BASE} element={<BrowsePage onCreate={handleCreate} />} />
      <Route path={`${WATCH_BASE}/browse`} element={<Navigate to={WATCH_BASE} replace />} />
      <Route path={joinPath} element={<JoinPage onJoin={handleJoin} />} />
      <Route
        path={`${WATCH_BASE}/room/:roomId`}
        element={<RoomRoute session={session} initialSync={initialSync} onJoin={handleJoin} onLeave={handleLeave} />}
      />
      <Route path="*" element={<Navigate to={WATCH_BASE} replace />} />
    </Routes>
  );
}

function LegacyRoomRedirect() {
  const { roomId } = useParams();
  return <Navigate to={roomPath(roomId)} replace />;
}

function RoomRoute({ session, initialSync, onJoin, onLeave }) {
  const { roomId } = useParams();
  if (!session || session.roomId !== roomId) {
    return <JoinPage presetRoomId={roomId} onJoin={onJoin} />;
  }
  return <RoomPage session={session} initialSync={initialSync} onLeave={onLeave} />;
}
