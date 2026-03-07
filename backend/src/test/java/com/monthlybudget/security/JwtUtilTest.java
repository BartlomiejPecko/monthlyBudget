package com.monthlybudget.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        String secret = Base64.getEncoder().encodeToString(
                "test-secret-key-that-is-at-least-32-bytes!!".getBytes()
        );
        long expirationMs = 3600000; // 1 hour
        jwtUtil = new JwtUtil(secret, expirationMs);
    }

    @Test
    void generateToken_shouldReturnNonNullToken() {
        String token = jwtUtil.generateToken("user@example.com");
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void extractEmail_shouldReturnCorrectEmail() {
        String email = "user@example.com";
        String token = jwtUtil.generateToken(email);

        assertEquals(email, jwtUtil.extractEmail(token));
    }

    @Test
    void isTokenValid_shouldReturnTrueForValidToken() {
        String email = "user@example.com";
        String token = jwtUtil.generateToken(email);

        assertTrue(jwtUtil.isTokenValid(token, email));
    }

    @Test
    void isTokenValid_shouldReturnFalseForWrongEmail() {
        String token = jwtUtil.generateToken("user@example.com");

        assertFalse(jwtUtil.isTokenValid(token, "other@example.com"));
    }

    @Test
    void isTokenValid_shouldThrowForExpiredToken() {
        String secret = Base64.getEncoder().encodeToString(
                "test-secret-key-that-is-at-least-32-bytes!!".getBytes()
        );
        JwtUtil shortLivedJwt = new JwtUtil(secret, -1000);
        String token = shortLivedJwt.generateToken("user@example.com");

        assertThrows(io.jsonwebtoken.ExpiredJwtException.class,
                () -> shortLivedJwt.isTokenValid(token, "user@example.com"));
    }

    @Test
    void extractEmail_shouldThrowForTamperedToken() {
        String token = jwtUtil.generateToken("user@example.com");
        String tamperedToken = token + "tampered";

        assertThrows(Exception.class, () -> jwtUtil.extractEmail(tamperedToken));
    }
}