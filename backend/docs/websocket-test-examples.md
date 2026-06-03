# WebSocket Test Examples

Endpoint: `ws://localhost:8080/ws`

Application prefix: `/app`

Broker subscriptions:

- Playback, reactions, and room system events: `/topic/room/{roomId}`
- Chat: `/topic/chat/{roomId}`
- Errors: `/topic/errors`

## Browser Console with STOMP

Install the STOMP client in a frontend project:

```bash
npm install @stomp/stompjs
```

```javascript
import { Client } from "@stomp/stompjs";

const roomId = "ABCD1234";
const client = new Client({
  brokerURL: "ws://localhost:8080/ws",
  reconnectDelay: 3000,
  onConnect: () => {
    client.subscribe(`/topic/room/${roomId}`, message => {
      console.log("room event", JSON.parse(message.body));
    });

    client.subscribe(`/topic/chat/${roomId}`, message => {
      console.log("chat event", JSON.parse(message.body));
    });

    client.publish({
      destination: "/app/playback",
      body: JSON.stringify({
        roomId,
        userId: "user1",
        action: "PLAY",
        currentTime: 120.5
      })
    });

    client.publish({
      destination: "/app/chat",
      body: JSON.stringify({
        roomId,
        userId: "user2",
        userName: "Aman",
        message: "Amazing scene 🔥"
      })
    });

    client.publish({
      destination: "/app/reaction",
      body: JSON.stringify({
        roomId,
        userId: "user2",
        emoji: "❤️"
      })
    });
  }
});

client.activate();
```

## Raw STOMP Frames

Connect to `ws://localhost:8080/ws`, then send:

```text
CONNECT
accept-version:1.2
host:localhost

^@
```

Subscribe to playback and system events:

```text
SUBSCRIBE
id:sub-room
destination:/topic/room/ABCD1234

^@
```

Subscribe to chat:

```text
SUBSCRIBE
id:sub-chat
destination:/topic/chat/ABCD1234

^@
```

Send playback:

```text
SEND
destination:/app/playback
content-type:application/json

{"roomId":"ABCD1234","userId":"user1","action":"SEEK","currentTime":1800.5}
^@
```

Send chat:

```text
SEND
destination:/app/chat
content-type:application/json

{"roomId":"ABCD1234","userId":"user2","userName":"Aman","message":"Amazing scene 🔥"}
^@
```

Send reaction:

```text
SEND
destination:/app/reaction
content-type:application/json

{"roomId":"ABCD1234","userId":"user2","emoji":"👍"}
^@
```
