package com.techtank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JoinRoomRequest {

    @NotBlank(message = "userId is required")
    @Size(max = 120, message = "userId must be at most 120 characters")
    private String userId;

    @NotBlank(message = "userName is required")
    @Size(max = 120, message = "userName must be at most 120 characters")
    private String userName;
}
