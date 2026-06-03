import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp as firestoreServerTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import {
  get,
  onChildAdded,
  onDisconnect,
  onValue,
  orderByChild,
  push,
  query as databaseQuery,
  ref,
  remove,
  serverTimestamp as databaseServerTimestamp,
  set,
  startAt
} from "firebase/database";
import { firestore, realtimeDb, requireFirebase } from "./config";
import { generateRoomCode } from "../utils/roomCode";

export async function createRoom({ movieId, user }) {
  requireFirebase();
  const roomId = generateRoomCode();
  const roomRef = doc(firestore, "rooms", roomId);
  const participant = participantPayload(user);

  await setDoc(roomRef, {
    roomId,
    movieId,
    hostId: user.uid,
    hostName: user.displayName || "Guest",
    participantIds: [user.uid],
    createdAt: firestoreServerTimestamp(),
    updatedAt: firestoreServerTimestamp()
  });
  await setDoc(doc(firestore, "rooms", roomId, "participants", user.uid), participant);
  await set(ref(realtimeDb, `playback/${roomId}`), {
    roomId,
    hostId: user.uid,
    action: "SYNC",
    playing: false,
    currentTime: 0,
    updatedAt: databaseServerTimestamp()
  });
  await markPresence(roomId, user);

  return { roomId, movieId, playing: false, currentTime: 0 };
}

export async function joinRoom({ roomId, user }) {
  requireFirebase();
  const roomRef = doc(firestore, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) {
    throw new Error(`Room not found: ${roomId}`);
  }

  const room = roomSnap.data();
  await setDoc(doc(firestore, "rooms", roomId, "participants", user.uid), participantPayload(user));
  await updateDoc(roomRef, {
    participantIds: Array.from(new Set([...(room.participantIds || []), user.uid])),
    updatedAt: firestoreServerTimestamp()
  });
  await markPresence(roomId, user);

  const playbackSnap = await get(ref(realtimeDb, `playback/${roomId}`));
  const playback = playbackSnap.val() || { playing: false, currentTime: 0, updatedAt: Date.now() };

  return {
    roomId,
    movieId: room.movieId,
    playing: Boolean(playback.playing),
    currentTime: effectiveCurrentTime(playback),
    baseCurrentTime: Number(playback.currentTime || 0),
    updatedAt: Number(playback.updatedAt || Date.now())
  };
}

export function listenRoom(roomId, callback) {
  requireFirebase();
  let roomData = null;
  let participants = [];

  const emit = () => {
    if (roomData) {
      callback({ ...roomData, participants });
    }
  };

  const unsubscribeRoom = onSnapshot(doc(firestore, "rooms", roomId), (snapshot) => {
    roomData = snapshot.exists() ? snapshot.data() : null;
    emit();
  });

  const participantsQuery = query(collection(firestore, "rooms", roomId, "participants"), orderBy("joinedAt", "asc"));
  const unsubscribeParticipants = onSnapshot(participantsQuery, (snapshot) => {
    participants = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    emit();
  });

  return () => {
    unsubscribeRoom();
    unsubscribeParticipants();
  };
}

export function listenPlayback(roomId, callback) {
  requireFirebase();
  const playbackRef = ref(realtimeDb, `playback/${roomId}`);
  return onValue(playbackRef, (snapshot) => {
    const value = snapshot.val();
    if (value) {
      callback({
        ...value,
        baseCurrentTime: Number(value.currentTime || 0),
        currentTime: effectiveCurrentTime(value),
        updatedAt: Number(value.updatedAt || Date.now())
      });
    }
  });
}

export async function sendPlayback(roomId, user, action, currentTime, hostId) {
  requireFirebase();
  const playing = action === "PLAY" ? true : action === "PAUSE" ? false : undefined;
  const currentSnap = await get(ref(realtimeDb, `playback/${roomId}`));
  const current = currentSnap.val() || {};

  await set(ref(realtimeDb, `playback/${roomId}`), {
    roomId,
    userId: user.uid,
    hostId,
    action,
    playing: playing ?? Boolean(current.playing),
    currentTime: Number(currentTime),
    updatedAt: databaseServerTimestamp()
  });
}

export async function sendChat(roomId, user, message) {
  requireFirebase();
  await addDoc(collection(firestore, "rooms", roomId, "messages"), {
    userId: user.uid,
    userName: user.displayName || "Guest",
    message,
    timestamp: firestoreServerTimestamp()
  });
}

export function listenChat(roomId, callback) {
  requireFirebase();
  const messagesQuery = query(collection(firestore, "rooms", roomId, "messages"), orderBy("timestamp", "asc"), limit(100));
  return onSnapshot(messagesQuery, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export async function sendReaction(roomId, user, emoji) {
  requireFirebase();
  await set(push(ref(realtimeDb, `reactions/${roomId}`)), {
    roomId,
    userId: user.uid,
    userName: user.displayName || "Guest",
    emoji,
    timestamp: databaseServerTimestamp()
  });
}

export function listenReactions(roomId, callback) {
  requireFirebase();
  const reactionsRef = databaseQuery(ref(realtimeDb, `reactions/${roomId}`), orderByChild("timestamp"), startAt(Date.now()));
  return onChildAdded(reactionsRef, (snapshot) => {
    callback({ id: snapshot.key, ...snapshot.val() });
  });
}

export async function leaveRoom(roomId, user) {
  requireFirebase();
  const roomRef = doc(firestore, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) {
    return;
  }
  const room = roomSnap.data();
  await deleteDoc(doc(firestore, "rooms", roomId, "participants", user.uid));
  await remove(ref(realtimeDb, `presence/${roomId}/${user.uid}`));

  const participantsSnap = await getDocs(query(collection(firestore, "rooms", roomId, "participants"), orderBy("joinedAt", "asc"), limit(1)));
  if (participantsSnap.empty) {
    await remove(ref(realtimeDb, `playback/${roomId}`));
    await deleteDoc(roomRef);
    return;
  }

  const remainingIds = (room.participantIds || []).filter((id) => id !== user.uid);
  const oldestParticipant = participantsSnap.docs[0].data();
  const update = {
    participantIds: remainingIds,
    updatedAt: firestoreServerTimestamp()
  };

  if (room.hostId === user.uid) {
    update.hostId = oldestParticipant.userId;
    update.hostName = oldestParticipant.userName;
    await set(push(ref(realtimeDb, `reactions/${roomId}`)), {
      roomId,
      system: true,
      emoji: "HOST_CHANGED",
      userId: oldestParticipant.userId,
      userName: oldestParticipant.userName,
      timestamp: databaseServerTimestamp()
    });
  }

  await updateDoc(roomRef, update);
}

export async function markPresence(roomId, user) {
  requireFirebase();
  const presenceRef = ref(realtimeDb, `presence/${roomId}/${user.uid}`);
  await set(presenceRef, {
    userId: user.uid,
    userName: user.displayName || "Guest",
    online: true,
    lastSeen: databaseServerTimestamp()
  });
  await onDisconnect(presenceRef).remove();
}

function participantPayload(user) {
  return {
    userId: user.uid,
    userName: user.displayName || "Guest",
    joinedAt: firestoreServerTimestamp()
  };
}

function effectiveCurrentTime(playback) {
  if (!playback.playing || !playback.updatedAt) {
    return Number(playback.currentTime || 0);
  }
  const elapsedSeconds = Math.max(0, (Date.now() - Number(playback.updatedAt)) / 1000);
  return Number(playback.currentTime || 0) + elapsedSeconds;
}
