export const SESSION_KEY = "techtank.watchTogether.session";

export function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}
