package com.techtank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateRoomRequest {

    @NotBlank(message = "movieId is required")
    @Size(max = 120, message = "movieId must be at most 120 characters")
    private String movieId;

    @NotBlank(message = "hostId is required")
    @Size(max = 120, message = "hostId must be at most 120 characters")
    private String hostId;

    @NotBlank(message = "hostName is required")
    @Size(max = 120, message = "hostName must be at most 120 characters")
    private String hostName;
}
