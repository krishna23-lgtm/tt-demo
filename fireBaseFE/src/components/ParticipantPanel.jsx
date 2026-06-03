import { Crown, Users } from "lucide-react";

export default function ParticipantPanel({ room, uid }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span>
          <Users size={17} aria-hidden="true" />
          Participants
        </span>
        <strong>{room.participants.length}</strong>
      </div>
      <div className="participant-list">
        {room.participants.map((participant) => (
          <div className="participant-row" key={participant.userId}>
            <span className="avatar">{participant.userName.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{participant.userName}</strong>
              <span>{participant.userId === uid ? "You" : "Viewer"}</span>
            </div>
            {participant.userId === room.hostId && <Crown size={16} title="Host" aria-label="Host" />}
          </div>
        ))}
      </div>
    </section>
  );
}
