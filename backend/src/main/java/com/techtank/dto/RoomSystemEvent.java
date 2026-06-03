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
public class RoomSystemEvent {

    private String roomId;
    private SystemEventType action;
    private String hostId;
    private String hostName;
    private Instant timestamp;
}
