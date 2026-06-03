# TechTank Firebase Watch Together

React frontend that uses Firebase directly instead of the Spring Boot backend.

## Firebase Services Used

- Firebase Auth: anonymous user session
- Cloud Firestore: rooms, participants, chat messages
- Realtime Database: playback sync, presence, reactions
- Firebase Hosting: optional deployment target

## Setup

Create `fireBaseFE/.env` from `.env.example` and paste your Firebase web app config.

Enable these Firebase products in your Firebase console:

- Authentication: enable Anonymous sign-in
- Cloud Firestore
- Realtime Database

Then run:

```bash
cd /Users/B0330588/Downloads/techtankDemo/fireBaseFE
npm install
npm run dev
```

Open `http://localhost:5174`.

## Routes

- `/watchTogether`: OTT catalog and create-room flow
- `/watchTogether/join`: join room
- `/watchTogether/room/:roomId`: Firebase-backed watch room

## Deploy

This project is configured for Firebase Hosting with SPA routing.

Before deploying, make sure `.env` contains all `VITE_FIREBASE_*` values and these Firebase products are enabled:

- Authentication with Anonymous sign-in
- Cloud Firestore
- Realtime Database
- Firebase Hosting

Deploy everything:

```bash
npm run deploy
```

Deploy only the frontend:

```bash
npm run deploy:hosting
```

Deploy only Firestore and Realtime Database rules:

```bash
npm run deploy:rules
```

Firebase Hosting runs `npm run build` automatically before hosting deploys. The deployed app serves `dist` and rewrites all routes to `index.html`, so direct room links such as `/watchTogether/room/ABCD1234` work after refresh.

## Production Note

This app works well for a Firebase MVP. For production-grade host transfer, entitlement checks, billing, and anti-abuse controls, move critical writes into Cloud Functions and keep client security rules strict.

## Video Hosting

The local catalog uses direct MP4 URLs so the native video player can sync play, pause, seek, and late-join time accurately. For production OTT content, prefer Firebase Storage, Google Cloud Storage, Cloudflare R2, AWS S3, or a CDN-backed HLS/DASH pipeline. YouTube-style embeds can be used, but they need a separate player API and are less reliable for exact watch-party synchronization.
