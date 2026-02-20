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

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email already in use");
        }

        User user = User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

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