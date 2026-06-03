package com.techtank.config;

import com.techtank.model.ChatMessage;
import com.techtank.model.RoomDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MongoIndexInitializer implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        mongoTemplate.indexOps(RoomDocument.class)
                .createIndex(new Index()
                        .on("roomId", Sort.Direction.ASC)
                        .unique()
                        .named("idx_rooms_roomId_unique"));

        mongoTemplate.indexOps(ChatMessage.class)
                .createIndex(new Index()
                        .on("roomId", Sort.Direction.ASC)
                        .on("timestamp", Sort.Direction.ASC)
                        .named("idx_chat_messages_roomId_timestamp"));
    }
}
