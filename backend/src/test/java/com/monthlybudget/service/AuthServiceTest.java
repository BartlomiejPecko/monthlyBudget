package com.monthlybudget.service;

import com.monthlybudget.dto.request.GoogleLoginRequest;
import com.monthlybudget.dto.request.LoginRequest;
import com.monthlybudget.dto.request.RegisterRequest;
import com.monthlybudget.dto.response.AuthResponse;
import com.monthlybudget.exception.BadRequestException;
import com.monthlybudget.model.AuthProvider;
import com.monthlybudget.model.User;
import com.monthlybudget.repository.UserRepository;
import com.monthlybudget.security.GoogleTokenVerifier;
import com.monthlybudget.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private GoogleTokenVerifier googleTokenVerifier;

    @InjectMocks
    private AuthService authService;

    // --- REGISTER ---

    @Test
    void register_shouldSucceedForNewUser() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("User@Example.COM");
        request.setPassword("password123");

        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtUtil.generateToken("user@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertEquals("jwt-token", response.getToken());
        assertEquals("user@example.com", response.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_shouldNormalizeEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("  USER@Test.COM  ");
        request.setPassword("pass");

        when(userRepository.existsByEmail("user@test.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtil.generateToken("user@test.com")).thenReturn("token");

        authService.register(request);

        verify(userRepository).existsByEmail("user@test.com");
    }

    @Test
    void register_shouldThrowWhenEmailExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@test.com");
        request.setPassword("pass");

        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> authService.register(request));
        assertEquals("Email already in use", ex.getMessage());
    }

    // --- LOGIN ---

    @Test
    void login_shouldReturnTokenOnSuccess() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@test.com");
        request.setPassword("pass");

        when(jwtUtil.generateToken("user@test.com")).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertEquals("jwt-token", response.getToken());
        verify(authenticationManager).authenticate(any());
    }

    // --- GOOGLE LOGIN ---

    @Test
    void googleLogin_shouldCreateNewUserIfNotExists() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setCredential("google-token");

        when(googleTokenVerifier.verify("google-token"))
                .thenReturn(Optional.of("newuser@gmail.com"));
        when(userRepository.findByEmail("newuser@gmail.com"))
                .thenReturn(Optional.empty());
        when(userRepository.save(any())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtUtil.generateToken("newuser@gmail.com")).thenReturn("token");

        AuthResponse response = authService.googleLogin(request);

        assertNotNull(response.getToken());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void googleLogin_shouldThrowWhenLocalUserTriesGoogle() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setCredential("google-token");

        User localUser = User.builder()
                .id(1L)
                .email("user@test.com")
                .authProvider(AuthProvider.LOCAL)
                .build();

        when(googleTokenVerifier.verify("google-token"))
                .thenReturn(Optional.of("user@test.com"));
        when(userRepository.findByEmail("user@test.com"))
                .thenReturn(Optional.of(localUser));

        assertThrows(BadRequestException.class, () -> authService.googleLogin(request));
    }

    @Test
    void googleLogin_shouldThrowWhenTokenInvalid() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setCredential("bad-token");

        when(googleTokenVerifier.verify("bad-token")).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> authService.googleLogin(request));
    }
}