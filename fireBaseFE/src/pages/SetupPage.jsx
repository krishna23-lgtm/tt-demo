import { AlertTriangle } from "lucide-react";

export default function SetupPage() {
  return (
    <main className="setup-page">
      <section className="setup-card">
        <AlertTriangle size={34} aria-hidden="true" />
        <h1>Connection setup needed</h1>
        <p>Create <code>fireBaseFE/.env</code> from <code>.env.example</code>, then paste your realtime app connection values.</p>
        <pre>{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_DATABASE_URL=...`}</pre>
      </section>
    </main>
  );
}
