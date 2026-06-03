package com.techtank;

import static org.assertj.core.api.Assertions.assertThat;

import com.techtank.util.RoomCodeGenerator;
import org.junit.jupiter.api.Test;

class TechtankDemoApplicationTests {

    @Test
    void roomCodeGeneratorCreatesExpectedFormat() {
        RoomCodeGenerator generator = new RoomCodeGenerator();

        String roomCode = generator.generate();

        assertThat(roomCode).matches("[A-Z]{4}[0-9]{4}");
    }
}
