# TechTank Watch Together

This workspace is split into two independent projects:

- `backend`: Java 21 Spring Boot 3.5 backend with MongoDB, MongoTemplate, Caffeine, REST, WebSocket, and STOMP.
- `frontend`: React + Vite frontend integrated with the backend REST and WebSocket endpoints.
- `fireBaseFE`: React + Vite frontend that uses Firebase Auth, Firestore, and Realtime Database directly.
- UI routes: `/browse`, `/join`, and `/room/:roomId`.
- The frontend includes a sample OTT catalog and plays synced video/audio through the existing STOMP playback events.

## Open In VS Code

Open the workspace file:

```bash
code /Users/B0330588/Downloads/techtankDemo/techtankDemo.code-workspace
```

## Run Backend

Start MongoDB, then:

```bash
cd /Users/B0330588/Downloads/techtankDemo/backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

## Run Frontend

```bash
cd /Users/B0330588/Downloads/techtankDemo/frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

The frontend proxies `/api` and `/ws` to the backend during local development.

## Run Firebase Frontend

Create `fireBaseFE/.env` from `fireBaseFE/.env.example`, paste your Firebase web app config, then enable Anonymous Auth, Cloud Firestore, and Realtime Database in Firebase.

```bash
cd /Users/B0330588/Downloads/techtankDemo/fireBaseFE
npm install
npm run dev
```

Firebase frontend runs on `http://localhost:5174`.
