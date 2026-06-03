package com.techtank.util;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

@Component
public class RoomCodeGenerator {

    private static final char[] LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
    private static final char[] DIGITS = "0123456789".toCharArray();
    private final SecureRandom secureRandom = new SecureRandom();

    public String generate() {
        StringBuilder builder = new StringBuilder(8);
        for (int index = 0; index < 4; index++) {
            builder.append(LETTERS[secureRandom.nextInt(LETTERS.length)]);
        }
        for (int index = 0; index < 4; index++) {
            builder.append(DIGITS[secureRandom.nextInt(DIGITS.length)]);
        }
        return builder.toString();
    }
}
