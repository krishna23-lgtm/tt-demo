package com.techtank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatEvent {

    @NotBlank(message = "roomId is required")
    @Size(max = 32, message = "roomId must be at most 32 characters")
    private String roomId;

    @NotBlank(message = "userId is required")
    @Size(max = 120, message = "userId must be at most 120 characters")
    private String userId;

    @NotBlank(message = "userName is required")
    @Size(max = 120, message = "userName must be at most 120 characters")
    private String userName;

    @NotBlank(message = "message is required")
    @Size(max = 1000, message = "message must be at most 1000 characters")
    private String message;
}
