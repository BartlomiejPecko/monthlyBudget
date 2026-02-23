package com.monthlybudget.service;

import com.monthlybudget.exception.BadRequestException;
import com.monthlybudget.model.User;
import com.monthlybudget.model.VerificationToken;
import com.monthlybudget.repository.UserRepository;
import com.monthlybudget.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final VerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.verification.token-expiry-hours}")
    private int tokenExpiryHours;

    /**
     * Generate a token and send the verification email.
     * Called after registration and on "resend" requests.
     */
    public void createAndSendToken(User user) {
        // Delete any existing tokens for this user (in case of resend)
        tokenRepository.deleteByUserId(user.getId());

        String tokenValue = UUID.randomUUID().toString();

        VerificationToken token = VerificationToken.builder()
                .token(tokenValue)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(tokenExpiryHours))
                .build();

        tokenRepository.save(token);
        emailService.sendVerificationEmail(user.getEmail(), tokenValue);
    }

    /**
     * Verify the token and activate the user account.
     */
    @Transactional
    public void verifyEmail(String tokenValue) {
        VerificationToken token = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new BadRequestException(
                        "Invalid verification link. Please request a new one."));

        if (token.isExpired()) {
            tokenRepository.delete(token);
            throw new BadRequestException(
                    "Verification link has expired. Please request a new one.");
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        // Clean up — token is no longer needed
        tokenRepository.delete(token);

        log.info("Email verified for user: {}", user.getEmail());
    }

    /**
     * Resend verification email (with a new token).
     */
    @Transactional
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email not found"));

        if (user.getEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        createAndSendToken(user);
    }
}