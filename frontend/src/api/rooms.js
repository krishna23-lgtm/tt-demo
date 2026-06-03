import { get, post } from "./client";

export function createRoom(payload) {
  return post("/rooms", payload);
}

export function joinRoom(roomId, payload) {
  return post(`/rooms/${encodeURIComponent(roomId)}/join`, payload);
}

export function leaveRoom(roomId, userId) {
  return post(`/rooms/${encodeURIComponent(roomId)}/leave`, { userId });
}

export function getRoom(roomId) {
  return get(`/rooms/${encodeURIComponent(roomId)}`);
}
