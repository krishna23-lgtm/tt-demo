package com.techtank.controller;

import com.techtank.dto.CreateRoomRequest;
import com.techtank.dto.CreateRoomResponse;
import com.techtank.dto.JoinRoomRequest;
import com.techtank.dto.JoinRoomResponse;
import com.techtank.dto.LeaveRoomRequest;
import com.techtank.dto.LeaveRoomResponse;
import com.techtank.dto.RoomResponse;
import com.techtank.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<CreateRoomResponse> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(request));
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<JoinRoomResponse> joinRoom(
            @PathVariable String roomId,
            @Valid @RequestBody JoinRoomRequest request
    ) {
        return ResponseEntity.ok(roomService.joinRoom(roomId, request));
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<LeaveRoomResponse> leaveRoom(
            @PathVariable String roomId,
            @RequestParam(required = false) String userId,
            @Valid @RequestBody(required = false) LeaveRoomRequest request
    ) {
        String resolvedUserId = userId;
        if ((resolvedUserId == null || resolvedUserId.isBlank()) && request != null) {
            resolvedUserId = request.getUserId();
        }
        return ResponseEntity.ok(roomService.leaveRoom(roomId, resolvedUserId));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(roomService.getRoom(roomId));
    }
}
