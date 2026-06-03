import { Plus } from "lucide-react";
import { useState } from "react";

export default function CreateRoomForm({ movie, onCreate, loading }) {
  const [form, setForm] = useState({
    hostId: "user1",
    hostName: "Ram"
  });

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onCreate({
      movieId: movie.id,
      hostId: form.hostId.trim(),
      hostName: form.hostName.trim()
    });
  };

  return (
    <form className="entry-form" onSubmit={submit}>
      <label>
        Host ID
        <input value={form.hostId} onChange={update("hostId")} required maxLength={120} />
      </label>

      <label>
        Host name
        <input value={form.hostName} onChange={update("hostName")} required maxLength={120} />
      </label>

      <button className="primary-action" type="submit" disabled={loading}>
        <Plus size={18} aria-hidden="true" />
        {loading ? "Creating" : "Create room"}
      </button>
    </form>
  );
}
