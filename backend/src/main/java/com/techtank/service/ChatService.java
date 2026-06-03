package com.techtank.service;

import com.techtank.dto.ChatEvent;
import com.techtank.dto.ChatMessageResponse;
import com.techtank.model.ChatMessage;
import com.techtank.repository.ChatMessageMongoRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final RoomService roomService;
    private final ChatMessageMongoRepository chatMessageMongoRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatMessageResponse handleChat(ChatEvent event) {
        roomService.getRoomDocument(event.getRoomId());

        ChatMessage saved = chatMessageMongoRepository.save(ChatMessage.builder()
                .roomId(event.getRoomId())
                .userId(event.getUserId())
                .userName(event.getUserName())
                .message(event.getMessage())
                .timestamp(Instant.now())
                .build());

        ChatMessageResponse response = ChatMessageResponse.builder()
                .id(saved.getId())
                .roomId(saved.getRoomId())
                .userId(saved.getUserId())
                .userName(saved.getUserName())
                .message(saved.getMessage())
                .timestamp(saved.getTimestamp())
                .build();

        messagingTemplate.convertAndSend("/topic/chat/" + event.getRoomId(), response);
        return response;
    }
}
