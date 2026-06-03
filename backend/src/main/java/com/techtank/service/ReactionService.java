package com.techtank.service;

import com.techtank.dto.ReactionEvent;
import com.techtank.dto.ReactionEventResponse;
import com.techtank.util.ReactionEmoji;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    public ReactionEventResponse handleReaction(ReactionEvent event) {
        roomService.getRoomDocument(event.getRoomId());
        if (!ReactionEmoji.isSupported(event.getEmoji())) {
            throw new IllegalArgumentException("Unsupported reaction emoji. Supported values: " + ReactionEmoji.supported());
        }

        ReactionEventResponse response = ReactionEventResponse.builder()
                .roomId(event.getRoomId())
                .userId(event.getUserId())
                .emoji(event.getEmoji())
                .timestamp(Instant.now())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + event.getRoomId(), response);
        return response;
    }
}
