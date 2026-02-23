package com.monthlybudget.scheduler;

import com.monthlybudget.model.User;
import com.monthlybudget.repository.UserRepository;
import com.monthlybudget.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class UnverifiedAccountCleanup {

    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;

    @Value("${app.verification.cleanup-after-days}")
    private int cleanupAfterDays;

    /**
     * Runs daily at 3:00 AM.
     * Deletes users who registered but never verified within the configured period.
     * CascadeType.ALL on User ensures accounts, categories, goals etc. are cleaned up too.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupUnverifiedAccounts() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(cleanupAfterDays);

        List<User> staleUsers = userRepository
                .findByEmailVerifiedFalseAndCreatedAtBefore(cutoff);

        if (staleUsers.isEmpty()) {
            log.debug("No stale unverified accounts to clean up.");
            return;
        }

        for (User user : staleUsers) {
            log.info("Removing unverified account: {} (created: {})",
                    user.getEmail(), user.getCreatedAt());
            tokenRepository.deleteByUserId(user.getId());
            userRepository.delete(user);
        }

        log.info("Cleaned up {} unverified account(s).", staleUsers.size());
    }
}