# TechTank Watch Together Frontend

React frontend for the Spring Boot Watch Together backend.

## Run

Start MongoDB and the backend first:

```bash
cd /Users/B0330588/Downloads/techtankDemo/backend
mvn spring-boot:run
```

Then start the frontend:

```bash
cd /Users/B0330588/Downloads/techtankDemo/frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Routes

- `/browse`: OTT catalog and create-room flow
- `/join`: join an existing watch room
- `/room/:roomId`: routed watch room with synced video, audio, chat, reactions, and participants

## Integration

During development, Vite proxies:

- `/api` to `http://localhost:8080`
- `/ws` to `ws://localhost:8080`

Override endpoints with:

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```
