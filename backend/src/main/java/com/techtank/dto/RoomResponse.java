package com.techtank.dto;

import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {

    private String roomId;
    private String movieId;
    private String hostId;
    private String hostName;
    private boolean playing;
    private double currentTime;
    private List<ParticipantResponse> participants;
    private Instant createdAt;
    private Instant updatedAt;
}
