import { Client } from "@stomp/stompjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const buildDefaultWsUrl = () => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
};

export function useWatchSocket(roomId) {
  const clientRef = useRef(null);
  const [status, setStatus] = useState("offline");
  const [lastPlayback, setLastPlayback] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [systemEvents, setSystemEvents] = useState([]);
  const [errors, setErrors] = useState([]);

  const brokerURL = useMemo(() => import.meta.env.VITE_WS_URL || buildDefaultWsUrl(), []);

  useEffect(() => {
    if (!roomId) {
      return undefined;
    }

    setStatus("connecting");

    const client = new Client({
      brokerURL,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setStatus("online");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const event = JSON.parse(message.body);

          if (event.action === "HOST_CHANGED") {
            setSystemEvents((previous) => [event, ...previous].slice(0, 12));
            return;
          }

          if (event.emoji) {
            setReactions((previous) => [{ ...event, id: crypto.randomUUID() }, ...previous].slice(0, 16));
            return;
          }

          if (event.action) {
            setLastPlayback(event);
          }
        });

        client.subscribe(`/topic/chat/${roomId}`, (message) => {
          const event = JSON.parse(message.body);
          setChatMessages((previous) => [...previous, event].slice(-80));
        });

        client.subscribe("/topic/errors", (message) => {
          setErrors((previous) => [message.body, ...previous].slice(0, 4));
        });
      },
      onDisconnect: () => setStatus("offline"),
      onStompError: (frame) => {
        setStatus("error");
        setErrors((previous) => [frame.headers.message || "STOMP error", ...previous].slice(0, 4));
      },
      onWebSocketClose: () => setStatus("offline"),
      onWebSocketError: () => setStatus("error")
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
      clientRef.current = null;
      setStatus("offline");
    };
  }, [brokerURL, roomId]);

  const publish = useCallback((destination, payload) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      setErrors((previous) => ["WebSocket is not connected", ...previous].slice(0, 4));
      return false;
    }

    client.publish({
      destination,
      body: JSON.stringify(payload)
    });
    return true;
  }, []);

  const sendPlayback = useCallback((payload) => publish("/app/playback", payload), [publish]);
  const sendChat = useCallback((payload) => publish("/app/chat", payload), [publish]);
  const sendReaction = useCallback((payload) => publish("/app/reaction", payload), [publish]);

  return {
    status,
    lastPlayback,
    chatMessages,
    reactions,
    systemEvents,
    errors,
    sendPlayback,
    sendChat,
    sendReaction
  };
}
