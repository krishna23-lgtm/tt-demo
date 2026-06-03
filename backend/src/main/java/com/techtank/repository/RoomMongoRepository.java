package com.techtank.repository;

import com.techtank.model.Participant;
import com.techtank.model.RoomDocument;
import java.time.Instant;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class RoomMongoRepository {

    private final MongoTemplate mongoTemplate;

    public RoomDocument save(RoomDocument roomDocument) {
        return mongoTemplate.save(roomDocument);
    }

    public Optional<RoomDocument> findByRoomId(String roomId) {
        Query query = Query.query(Criteria.where("roomId").is(roomId));
        return Optional.ofNullable(mongoTemplate.findOne(query, RoomDocument.class));
    }

    public Optional<RoomDocument> joinRoom(String roomId, Participant participant) {
        Query query = Query.query(Criteria.where("roomId").is(roomId)
                .and("participants.userId").ne(participant.getUserId()));
        Update update = new Update()
                .push("participants", participant)
                .set("updatedAt", Instant.now());
        mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                RoomDocument.class
        );
        return findByRoomId(roomId);
    }

    public Optional<RoomDocument> leaveRoom(String roomId, String userId) {
        Query query = Query.query(Criteria.where("roomId").is(roomId));
        Query pullQuery = Query.query(Criteria.where("userId").is(userId));
        Update update = new Update()
                .pull("participants", pullQuery.getQueryObject())
                .set("updatedAt", Instant.now());
        RoomDocument updated = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                RoomDocument.class
        );
        return Optional.ofNullable(updated);
    }

    public Optional<RoomDocument> updateHost(String roomId, Participant newHost) {
        Query query = Query.query(Criteria.where("roomId").is(roomId));
        Update update = new Update()
                .set("hostId", newHost.getUserId())
                .set("hostName", newHost.getUserName())
                .set("updatedAt", Instant.now());
        RoomDocument updated = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                RoomDocument.class
        );
        return Optional.ofNullable(updated);
    }

    public void deleteRoom(String roomId) {
        Query query = Query.query(Criteria.where("roomId").is(roomId));
        mongoTemplate.remove(query, RoomDocument.class);
    }
}
