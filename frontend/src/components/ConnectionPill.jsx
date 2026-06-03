import { Wifi, WifiOff } from "lucide-react";

const labels = {
  online: "Live",
  connecting: "Connecting",
  offline: "Offline",
  error: "Check socket"
};

export default function ConnectionPill({ status }) {
  const Icon = status === "online" ? Wifi : WifiOff;

  return (
    <span className={`connection-pill ${status}`}>
      <Icon size={15} aria-hidden="true" />
      {labels[status] || "Offline"}
    </span>
  );
}
