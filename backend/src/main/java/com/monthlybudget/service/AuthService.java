package com.monthlybudget.service;

import com.monthlybudget.dto.request.LoginRequest;
import com.monthlybudget.dto.request.RegisterRequest;
import com.monthlybudget.dto.response.AuthResponse;
import com.monthlybudget.exception.BadRequestException;
import com.monthlybudget.model.User;
import com.monthlybudget.repository.UserRepository;
import com.monthlybudget.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final VerificationService verificationService;

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email already in use");
        }

        User user = User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .emailVerified(false)
                .build();

        userRepository.save(user);

        // Send verification email instead of returning a JWT immediately
        verificationService.createAndSendToken(user);

        // Return a response WITHOUT a token — user must verify first
        return new AuthResponse(null, user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        // Check verification BEFORE authenticating password
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        if (!user.getEmailVerified()) {
            throw new BadRequestException(
                    "Please verify your email before logging in. Check your inbox.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        String token = jwtUtil.generateToken(normalizedEmail);
        return new AuthResponse(token, normalizedEmail);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}