import { browserSessionPersistence, onAuthStateChanged, setPersistence, signInAnonymously, updateProfile } from "firebase/auth";
import { auth, requireFirebase } from "./config";

let persistencePromise;

export function listenAuth(callback) {
  requireFirebase();
  return onAuthStateChanged(auth, callback);
}

export async function ensureAnonymousUser(displayName) {
  requireFirebase();
  if (!persistencePromise) {
    persistencePromise = setPersistence(auth, browserSessionPersistence);
  }
  await persistencePromise;

  const credential = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
  if (displayName && credential.user.displayName !== displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential.user;
}
