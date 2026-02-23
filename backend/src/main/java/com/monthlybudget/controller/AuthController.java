package com.monthlybudget.controller;

import com.monthlybudget.dto.request.LoginRequest;
import com.monthlybudget.dto.request.RegisterRequest;
import com.monthlybudget.dto.response.AuthResponse;
import com.monthlybudget.service.AuthService;
import com.monthlybudget.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final VerificationService verificationService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        verificationService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully! You can now log in."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        verificationService.resendVerification(email);
        return ResponseEntity.ok(Map.of("message", "Verification email sent. Check your inbox."));
    }
}