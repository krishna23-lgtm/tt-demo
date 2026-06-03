package com.techtank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRoomResponse {

    private String roomId;
    private String userId;
    private boolean hostChanged;
    private String newHostId;
    private String newHostName;
    private boolean roomDeleted;
}
