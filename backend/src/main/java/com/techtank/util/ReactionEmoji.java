package com.techtank.util;

import java.util.Set;

public final class ReactionEmoji {

    private static final Set<String> SUPPORTED = Set.of("❤️", "😂", "🔥", "👍");

    private ReactionEmoji() {
    }

    public static boolean isSupported(String emoji) {
        return SUPPORTED.contains(emoji);
    }

    public static Set<String> supported() {
        return SUPPORTED;
    }
}
