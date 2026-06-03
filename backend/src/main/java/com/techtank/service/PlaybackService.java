package com.techtank.service;

import com.techtank.cache.ActiveRoom;
import com.techtank.cache.ActiveRoomCache;
import com.techtank.dto.PlaybackAction;
import com.techtank.dto.PlaybackEvent;
import com.techtank.dto.PlaybackEventResponse;
import com.techtank.model.RoomDocument;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlaybackService {

    private final RoomService roomService;
    private final ActiveRoomCache activeRoomCache;
    private final SimpMessagingTemplate messagingTemplate;

    public PlaybackEventResponse handlePlayback(PlaybackEvent event) {
        RoomDocument roomDocument = roomService.getRoomDocument(event.getRoomId());
        ActiveRoom activeRoom = activeRoomCache.getOrCreate(roomDocument);

        if (event.getAction() == PlaybackAction.PLAY) {
            activeRoom = activeRoomCache.updatePlayback(event.getRoomId(), event.getCurrentTime(), true);
        } else if (event.getAction() == PlaybackAction.PAUSE) {
            activeRoom = activeRoomCache.updatePlayback(event.getRoomId(), event.getCurrentTime(), false);
        } else if (event.getAction() == PlaybackAction.SEEK || event.getAction() == PlaybackAction.SYNC) {
            activeRoom = activeRoomCache.updateTime(event.getRoomId(), event.getCurrentTime());
        }

        PlaybackEventResponse response = PlaybackEventResponse.builder()
                .roomId(event.getRoomId())
                .userId(event.getUserId())
                .action(event.getAction())
                .currentTime(activeRoom.getCurrentTime())
                .playing(activeRoom.isPlaying())
                .timestamp(Instant.now())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + event.getRoomId(), response);
        return response;
    }
}
