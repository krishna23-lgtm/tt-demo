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
public class ReactionEvent {

    @NotBlank(message = "roomId is required")
    @Size(max = 32, message = "roomId must be at most 32 characters")
    private String roomId;

    @NotBlank(message = "userId is required")
    @Size(max = 120, message = "userId must be at most 120 characters")
    private String userId;

    @NotBlank(message = "emoji is required")
    @Size(max = 8, message = "emoji must be at most 8 characters")
    private String emoji;
}
