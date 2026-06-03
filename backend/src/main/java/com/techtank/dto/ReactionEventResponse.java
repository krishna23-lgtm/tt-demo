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
public class ReactionEventResponse {

    private String roomId;
    private String userId;
    private String emoji;
    private Instant timestamp;
}
