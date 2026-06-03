package com.techtank.cache;

import com.github.benmanes.caffeine.cache.Cache;
import com.techtank.model.Participant;
import com.techtank.model.RoomDocument;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ActiveRoomCache {

    private final Cache<String, ActiveRoom> activeRoomCache;

    public ActiveRoom putRoom(RoomDocument roomDocument) {
        ActiveRoom activeRoom = ActiveRoom.builder()
                .roomId(roomDocument.getRoomId())
                .hostId(roomDocument.getHostId())
                .currentTime(0.0)
                .playing(false)
                .connectedUsers(toActiveUsers(roomDocument))
                .build();
        activeRoomCache.put(roomDocument.getRoomId(), activeRoom);
        return activeRoom;
    }

    public ActiveRoom getOrCreate(RoomDocument roomDocument) {
        return activeRoomCache.get(roomDocument.getRoomId(), roomId -> ActiveRoom.builder()
                .roomId(roomId)
                .hostId(roomDocument.getHostId())
                .currentTime(0.0)
                .playing(false)
                .connectedUsers(toActiveUsers(roomDocument))
                .build());
    }

    public Optional<ActiveRoom> get(String roomId) {
        return Optional.ofNullable(activeRoomCache.getIfPresent(roomId));
    }

    public ActiveRoom addUser(RoomDocument roomDocument, Participant participant) {
        ActiveRoom activeRoom = getOrCreate(roomDocument);
        synchronized (activeRoom) {
            activeRoom.setHostId(roomDocument.getHostId());
            activeRoom.getConnectedUsers().putIfAbsent(participant.getUserId(), ActiveUser.builder()
                    .userId(participant.getUserId())
                    .userName(participant.getUserName())
                    .connectedAt(Instant.now())
                    .build());
        }
        activeRoomCache.put(roomDocument.getRoomId(), activeRoom);
        return activeRoom;
    }

    public Optional<ActiveRoom> removeUser(String roomId, String userId) {
        ActiveRoom activeRoom = activeRoomCache.getIfPresent(roomId);
        if (activeRoom == null) {
            return Optional.empty();
        }
        synchronized (activeRoom) {
            activeRoom.getConnectedUsers().remove(userId);
        }
        activeRoomCache.put(roomId, activeRoom);
        return Optional.of(activeRoom);
    }

    public ActiveRoom updatePlayback(String roomId, double currentTime, boolean playing) {
        ActiveRoom activeRoom = activeRoomCache.get(roomId, key -> ActiveRoom.builder()
                .roomId(key)
                .currentTime(0.0)
                .playing(false)
                .connectedUsers(new LinkedHashMap<>())
                .build());
        synchronized (activeRoom) {
            activeRoom.setCurrentTime(currentTime);
            activeRoom.setPlaying(playing);
        }
        activeRoomCache.put(roomId, activeRoom);
        return activeRoom;
    }

    public ActiveRoom updateTime(String roomId, double currentTime) {
        ActiveRoom activeRoom = activeRoomCache.get(roomId, key -> ActiveRoom.builder()
                .roomId(key)
                .currentTime(0.0)
                .playing(false)
                .connectedUsers(new LinkedHashMap<>())
                .build());
        synchronized (activeRoom) {
            activeRoom.setCurrentTime(currentTime);
        }
        activeRoomCache.put(roomId, activeRoom);
        return activeRoom;
    }

    public void updateHost(String roomId, String hostId) {
        ActiveRoom activeRoom = activeRoomCache.getIfPresent(roomId);
        if (activeRoom == null) {
            return;
        }
        synchronized (activeRoom) {
            activeRoom.setHostId(hostId);
        }
        activeRoomCache.put(roomId, activeRoom);
    }

    public void evict(String roomId) {
        activeRoomCache.invalidate(roomId);
    }

    private Map<String, ActiveUser> toActiveUsers(RoomDocument roomDocument) {
        Map<String, ActiveUser> users = new LinkedHashMap<>();
        if (roomDocument.getParticipants() == null) {
            return users;
        }
        for (Participant participant : roomDocument.getParticipants()) {
            users.put(participant.getUserId(), ActiveUser.builder()
                    .userId(participant.getUserId())
                    .userName(participant.getUserName())
                    .connectedAt(participant.getJoinedAt())
                    .build());
        }
        return users;
    }
}
