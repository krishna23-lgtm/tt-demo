package com.techtank.controller;

import com.techtank.dto.ChatEvent;
import com.techtank.dto.PlaybackEvent;
import com.techtank.dto.ReactionEvent;
import com.techtank.service.ChatService;
import com.techtank.service.PlaybackService;
import com.techtank.service.ReactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

@Validated
@Controller
@RequiredArgsConstructor
public class WatchTogetherWebSocketController {

    private final PlaybackService playbackService;
    private final ChatService chatService;
    private final ReactionService reactionService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/playback")
    public void playback(@Valid @Payload PlaybackEvent event) {
        playbackService.handlePlayback(event);
    }

    @MessageMapping("/chat")
    public void chat(@Valid @Payload ChatEvent event) {
        chatService.handleChat(event);
    }

    @MessageMapping("/reaction")
    public void reaction(@Valid @Payload ReactionEvent event) {
        reactionService.handleReaction(event);
    }

    @MessageExceptionHandler
    public void handleWebSocketException(Exception exception) {
        messagingTemplate.convertAndSend("/topic/errors", exception.getMessage());
    }
}
