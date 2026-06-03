package com.techtank.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.techtank.cache.ActiveRoom;
import java.time.Duration;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public Cache<String, ActiveRoom> activeRoomStateCache() {
        return Caffeine.newBuilder()
                .expireAfterAccess(Duration.ofHours(6))
                .maximumSize(10_000)
                .recordStats()
                .build();
    }
}
