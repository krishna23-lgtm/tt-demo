import { Flame, Heart, Laugh, ThumbsUp } from "lucide-react";

const reactions = [
  { emoji: "❤️", label: "Heart", icon: Heart },
  { emoji: "😂", label: "Laugh", icon: Laugh },
  { emoji: "🔥", label: "Fire", icon: Flame },
  { emoji: "👍", label: "Thumbs up", icon: ThumbsUp }
];

export default function ReactionBar({ onReact, floatingReactions }) {
  return (
    <div className="reaction-zone">
      <div className="reaction-buttons" aria-label="Reactions">
        {reactions.map(({ emoji, label, icon: Icon }) => (
          <button key={emoji} type="button" className="icon-button reaction-button" onClick={() => onReact(emoji)} title={label}>
            <Icon size={18} aria-hidden="true" />
            <span>{emoji}</span>
          </button>
        ))}
      </div>

      <div className="reaction-float" aria-live="polite">
        {floatingReactions.map((reaction) => (
          <span key={reaction.id}>{reaction.emoji}</span>
        ))}
      </div>
    </div>
  );
}
