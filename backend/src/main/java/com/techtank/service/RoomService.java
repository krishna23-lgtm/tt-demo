package com.techtank.service;

import com.techtank.cache.ActiveRoom;
import com.techtank.cache.ActiveRoomCache;
import com.techtank.dto.CreateRoomRequest;
import com.techtank.dto.CreateRoomResponse;
import com.techtank.dto.JoinRoomRequest;
import com.techtank.dto.JoinRoomResponse;
import com.techtank.dto.LeaveRoomResponse;
import com.techtank.dto.ParticipantResponse;
import com.techtank.dto.RoomResponse;
import com.techtank.dto.RoomSystemEvent;
import com.techtank.dto.SystemEventType;
import com.techtank.exception.RoomNotFoundException;
import com.techtank.model.Participant;
import com.techtank.model.RoomDocument;
import com.techtank.repository.RoomMongoRepository;
import com.techtank.util.RoomCodeGenerator;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomService {

    private static final int MAX_ROOM_CODE_ATTEMPTS = 20;

    private final RoomMongoRepository roomMongoRepository;
    private final ActiveRoomCache activeRoomCache;
    private final RoomCodeGenerator roomCodeGenerator;
    private final SimpMessagingTemplate messagingTemplate;

    public CreateRoomResponse createRoom(CreateRoomRequest request) {
        Instant now = Instant.now();
        Participant host = Participant.builder()
                .userId(request.getHostId())
                .userName(request.getHostName())
                .joinedAt(now)
                .build();

        for (int attempt = 0; attempt < MAX_ROOM_CODE_ATTEMPTS; attempt++) {
            String roomId = roomCodeGenerator.generate();
            RoomDocument roomDocument = RoomDocument.builder()
                    .roomId(roomId)
                    .movieId(request.getMovieId())
                    .hostId(request.getHostId())
                    .hostName(request.getHostName())
                    .participants(List.of(host))
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            try {
                RoomDocument saved = roomMongoRepository.save(roomDocument);
                activeRoomCache.putRoom(saved);
                return CreateRoomResponse.builder()
                        .roomId(saved.getRoomId())
                        .movieId(saved.getMovieId())
                        .build();
            } catch (DuplicateKeyException ignored) {
                // A rare generated-code collision is retried with a fresh code.
            }
        }

        throw new IllegalStateException("Unable to allocate a unique room code");
    }

    public JoinRoomResponse joinRoom(String roomId, JoinRoomRequest request) {
        getRoomDocument(roomId);
        Participant participant = Participant.builder()
                .userId(request.getUserId())
                .userName(request.getUserName())
                .joinedAt(Instant.now())
                .build();

        RoomDocument updated = roomMongoRepository.joinRoom(roomId, participant)
                .orElseThrow(() -> new RoomNotFoundException(roomId));
        ActiveRoom activeRoom = activeRoomCache.addUser(updated, participant);

        return JoinRoomResponse.builder()
                .playing(activeRoom.isPlaying())
                .currentTime(activeRoom.getCurrentTime())
                .build();
    }

    public LeaveRoomResponse leaveRoom(String roomId, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId is required to leave a room");
        }

        RoomDocument existing = getRoomDocument(roomId);
        boolean leavingHost = userId.equals(existing.getHostId());

        RoomDocument afterLeave = roomMongoRepository.leaveRoom(roomId, userId)
                .orElseThrow(() -> new RoomNotFoundException(roomId));
        activeRoomCache.removeUser(roomId, userId);

        if (afterLeave.getParticipants() == null || afterLeave.getParticipants().isEmpty()) {
            roomMongoRepository.deleteRoom(roomId);
            activeRoomCache.evict(roomId);
            return LeaveRoomResponse.builder()
                    .roomId(roomId)
                    .userId(userId)
                    .hostChanged(false)
                    .roomDeleted(true)
                    .build();
        }

        if (!leavingHost) {
            return LeaveRoomResponse.builder()
                    .roomId(roomId)
                    .userId(userId)
                    .hostChanged(false)
                    .roomDeleted(false)
                    .newHostId(afterLeave.getHostId())
                    .newHostName(afterLeave.getHostName())
                    .build();
        }

        Participant newHost = afterLeave.getParticipants().stream()
                .min(Comparator.comparing(Participant::getJoinedAt))
                .orElseThrow(() -> new RoomNotFoundException(roomId));
        RoomDocument updatedHostRoom = roomMongoRepository.updateHost(roomId, newHost)
                .orElseThrow(() -> new RoomNotFoundException(roomId));
        activeRoomCache.updateHost(roomId, newHost.getUserId());
        broadcastHostChanged(updatedHostRoom);

        return LeaveRoomResponse.builder()
                .roomId(roomId)
                .userId(userId)
                .hostChanged(true)
                .newHostId(newHost.getUserId())
                .newHostName(newHost.getUserName())
                .roomDeleted(false)
                .build();
    }

    public RoomResponse getRoom(String roomId) {
        RoomDocument roomDocument = getRoomDocument(roomId);
        ActiveRoom activeRoom = activeRoomCache.getOrCreate(roomDocument);
        return toRoomResponse(roomDocument, activeRoom);
    }

    public RoomDocument getRoomDocument(String roomId) {
        return roomMongoRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RoomNotFoundException(roomId));
    }

    private void broadcastHostChanged(RoomDocument roomDocument) {
        RoomSystemEvent event = RoomSystemEvent.builder()
                .roomId(roomDocument.getRoomId())
                .action(SystemEventType.HOST_CHANGED)
                .hostId(roomDocument.getHostId())
                .hostName(roomDocument.getHostName())
                .timestamp(Instant.now())
                .build();
        messagingTemplate.convertAndSend("/topic/room/" + roomDocument.getRoomId(), event);
    }

    private RoomResponse toRoomResponse(RoomDocument roomDocument, ActiveRoom activeRoom) {
        List<ParticipantResponse> participants = roomDocument.getParticipants().stream()
                .map(participant -> ParticipantResponse.builder()
                        .userId(participant.getUserId())
                        .userName(participant.getUserName())
                        .joinedAt(participant.getJoinedAt())
                        .build())
                .toList();

        return RoomResponse.builder()
                .roomId(roomDocument.getRoomId())
                .movieId(roomDocument.getMovieId())
                .hostId(roomDocument.getHostId())
                .hostName(roomDocument.getHostName())
                .playing(activeRoom.isPlaying())
                .currentTime(activeRoom.getCurrentTime())
                .participants(participants)
                .createdAt(roomDocument.getCreatedAt())
                .updatedAt(roomDocument.getUpdatedAt())
                .build();
    }
}
