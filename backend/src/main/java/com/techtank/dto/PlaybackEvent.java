package com.techtank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaybackEvent {

    @NotBlank(message = "roomId is required")
    @Size(max = 32, message = "roomId must be at most 32 characters")
    private String roomId;

    @NotBlank(message = "userId is required")
    @Size(max = 120, message = "userId must be at most 120 characters")
    private String userId;

    @NotNull(message = "action is required")
    private PlaybackAction action;

    @NotNull(message = "currentTime is required")
    @PositiveOrZero(message = "currentTime must be zero or greater")
    private Double currentTime;
}
