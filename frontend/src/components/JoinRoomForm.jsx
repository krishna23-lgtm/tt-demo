import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";

export default function JoinRoomForm({ initialRoomId = "", onJoin, loading }) {
  const [form, setForm] = useState({
    roomId: initialRoomId,
    userId: "user2",
    userName: "Aman"
  });

  useEffect(() => {
    setForm((current) => ({ ...current, roomId: initialRoomId }));
  }, [initialRoomId]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value.toUpperCase?.() || event.target.value }));
  };

  const updateName = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onJoin({
      roomId: form.roomId.trim().toUpperCase(),
      userId: form.userId.trim(),
      userName: form.userName.trim()
    });
  };

  return (
    <form className="entry-form" onSubmit={submit}>
      <label>
        Room code
        <input
          className="room-code-input"
          value={form.roomId}
          onChange={update("roomId")}
          required
          maxLength={8}
          placeholder="ABCD1234"
        />
      </label>

      <label>
        User ID
        <input value={form.userId} onChange={updateName("userId")} required maxLength={120} />
      </label>

      <label>
        Name
        <input value={form.userName} onChange={updateName("userName")} required maxLength={120} />
      </label>

      <button className="primary-action" type="submit" disabled={loading}>
        <LogIn size={18} aria-hidden="true" />
        {loading ? "Joining" : "Join room"}
      </button>
    </form>
  );
}
