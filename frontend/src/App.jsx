import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { createRoom, joinRoom } from "./api/rooms";
import BrowsePage from "./pages/BrowsePage";
import JoinPage from "./pages/JoinPage";
import RoomShell from "./components/RoomShell";
import { readSession, SESSION_KEY } from "./utils/session";

export default function App() {
  const navigate = useNavigate();
  const [session, setSession] = useState(readSession);
  const [initialSync, setInitialSync] = useState(null);

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const handleCreate = async (payload) => {
    const room = await createRoom(payload);
    const nextSession = {
      roomId: room.roomId,
      movieId: room.movieId,
      userId: payload.hostId,
      userName: payload.hostName
    };
    setInitialSync({ playing: false, currentTime: 0 });
    setSession(nextSession);
    navigate(`/room/${room.roomId}`);
  };

  const handleJoin = async ({ roomId, userId, userName }) => {
    const sync = await joinRoom(roomId, { userId, userName });
    const nextSession = { roomId, userId, userName };
    setInitialSync(sync);
    setSession(nextSession);
    navigate(`/room/${roomId}`);
  };

  const handleLeave = () => {
    setInitialSync(null);
    setSession(null);
    navigate("/browse");
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/browse" replace />} />
      <Route path="/browse" element={<BrowsePage onCreate={handleCreate} />} />
      <Route path="/join" element={<JoinPage onJoin={handleJoin} />} />
      <Route
        path="/room/:roomId"
        element={<RoomRoute session={session} initialSync={initialSync} onJoin={handleJoin} onLeave={handleLeave} />}
      />
      <Route path="*" element={<Navigate to="/browse" replace />} />
    </Routes>
  );
}

function RoomRoute({ session, initialSync, onJoin, onLeave }) {
  const { roomId } = useParams();

  if (!session || session.roomId !== roomId) {
    return <JoinPage presetRoomId={roomId} onJoin={onJoin} />;
  }

  return <RoomShell session={session} initialSync={initialSync} onLeave={onLeave} />;
}
