package com.monthlybudget.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int AUTH_MAX_REQUESTS = 5;      // max 10 login/register attempts
    private static final int AUTH_WINDOW_SECONDS = 60;     // per 60 seconds
    private static final int GENERAL_MAX_REQUESTS = 100;   // max 100 API calls
    private static final int GENERAL_WINDOW_SECONDS = 60;  // per 60 seconds

    private final Map<String, RateBucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, RateBucket> generalBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String clientIp = getClientIp(request);
        String path = request.getRequestURI();

        if (path.startsWith("/api/auth/")) {
            if (!isAllowed(authBuckets, clientIp, AUTH_MAX_REQUESTS, AUTH_WINDOW_SECONDS)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"status\":429,\"message\":\"Too many authentication attempts. Try again later.\"}"
                );
                return;
            }
        }

        if (path.startsWith("/api/")) {
            if (!isAllowed(generalBuckets, clientIp, GENERAL_MAX_REQUESTS, GENERAL_WINDOW_SECONDS)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"status\":429,\"message\":\"Rate limit exceeded. Try again later.\"}"
                );
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowed(Map<String, RateBucket> buckets, String key, int max, int windowSeconds) {
        long now = System.currentTimeMillis();
        buckets.entrySet().removeIf(e -> e.getValue().isExpired(now));

        RateBucket bucket = buckets.computeIfAbsent(key, k -> new RateBucket(now, windowSeconds));

        if (bucket.isExpired(now)) {
            bucket.reset(now);
        }

        return bucket.tryConsume(max);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isEmpty()) {
            return realIp;
        }
        return request.getRemoteAddr();
    }

    private static class RateBucket {
        private long windowStart;
        private final int windowSeconds;
        private final AtomicInteger count = new AtomicInteger(0);

        RateBucket(long now, int windowSeconds) {
            this.windowStart = now;
            this.windowSeconds = windowSeconds;
        }

        boolean isExpired(long now) {
            return (now - windowStart) > (windowSeconds * 1000L);
        }

        void reset(long now) {
            this.windowStart = now;
            this.count.set(0);
        }

        boolean tryConsume(int max) {
            return count.incrementAndGet() <= max;
        }
    }
}