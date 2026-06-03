package com.techtank.cache;

import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveRoom {

    private String roomId;
    private String hostId;
    private double currentTime;
    private boolean playing;

    @Builder.Default
    private Map<String, ActiveUser> connectedUsers = new LinkedHashMap<>();
}
