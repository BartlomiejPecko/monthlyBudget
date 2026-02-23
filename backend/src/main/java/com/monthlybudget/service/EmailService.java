package com.monthlybudget.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async
    public void sendVerificationEmail(String toEmail, String token) {
        String confirmUrl = frontendUrl + "/verify-email?token=" + token;

        String subject = "Confirm your MonthlyBudget account";
        String body = """
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to MonthlyBudget!</h2>
                <p>Please confirm your email address by clicking the button below:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="%s"
                       style="background-color: #4CAF50; color: white; padding: 14px 28px;
                              text-decoration: none; border-radius: 6px; font-size: 16px;">
                        Confirm Email
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    This link expires in 24 hours.<br>
                    If you didn't create this account, just ignore this email.
                </p>
                <p style="color: #999; font-size: 12px;">
                    Or copy this link: %s
                </p>
            </body>
            </html>
            """.formatted(confirmUrl, confirmUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, true); // true = HTML

            mailSender.send(message);
            log.info("Verification email sent to {}", toEmail);
        } catch (MessagingException | MailException e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
        }
    }
}