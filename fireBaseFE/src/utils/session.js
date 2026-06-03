export const FIREBASE_SESSION_KEY = "techtank.firebase.session";

export function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(FIREBASE_SESSION_KEY));
  } catch {
    return null;
  }
}

export function saveSession(session) {
  sessionStorage.setItem(FIREBASE_SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(FIREBASE_SESSION_KEY);
  localStorage.removeItem(FIREBASE_SESSION_KEY);
}
