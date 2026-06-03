package com.techtank.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaybackEventResponse {

    private String roomId;
    private String userId;
    private PlaybackAction action;
    private double currentTime;
    private boolean playing;
    private Instant timestamp;
}
