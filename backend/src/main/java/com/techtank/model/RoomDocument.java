package com.techtank.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rooms")
public class RoomDocument {

    @Id
    private String id;

    private String roomId;
    private String movieId;
    private String hostId;
    private String hostName;

    @Builder.Default
    private List<Participant> participants = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;
}
