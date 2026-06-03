package com.techtank.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LeaveRoomRequest {

    @Size(max = 120, message = "userId must be at most 120 characters")
    private String userId;
}
