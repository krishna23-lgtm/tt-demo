import { Crown, Users } from "lucide-react";

export default function ParticipantsPanel({ room, currentUserId }) {
  const participants = room?.participants || [];

  return (
    <section className="panel participants-panel">
      <div className="panel-heading">
        <span>
          <Users size={17} aria-hidden="true" />
          Participants
        </span>
        <strong>{participants.length}</strong>
      </div>

      <div className="participant-list">
        {participants.map((participant) => {
          const isHost = participant.userId === room.hostId;
          const isCurrentUser = participant.userId === currentUserId;

          return (
            <div className="participant-row" key={participant.userId}>
              <div>
                <strong>{participant.userName}</strong>
                <span>{participant.userId}</span>
              </div>
              <div className="participant-flags">
                {isHost && <Crown size={16} title="Host" aria-label="Host" />}
                {isCurrentUser && <span className="mini-chip">You</span>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
