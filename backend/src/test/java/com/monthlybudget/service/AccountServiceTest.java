package com.monthlybudget.service;

import com.monthlybudget.dto.request.AccountRequest;
import com.monthlybudget.dto.response.AccountResponse;
import com.monthlybudget.exception.ResourceNotFoundException;
import com.monthlybudget.mapper.AccountMapper;
import com.monthlybudget.model.Account;
import com.monthlybudget.model.User;
import com.monthlybudget.repository.AccountRepository;
import com.monthlybudget.security.AuthHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock private AccountRepository accountRepository;
    @Mock private AccountMapper accountMapper;
    @Mock private AuthHelper authHelper;

    @InjectMocks
    private AccountService accountService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@test.com").build();
    }

    @Test
    void create_shouldSetCurrentBalanceToInitialBalance() {
        when(authHelper.getCurrentUser()).thenReturn(user);
        when(accountRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(accountMapper.toResponse(any())).thenReturn(new AccountResponse());

        AccountRequest request = new AccountRequest();
        request.setName("Savings");
        request.setInitialBalance(new BigDecimal("5000.00"));

        accountService.create(request);

        verify(accountRepository).save(argThat(account ->
                account.getCurrentBalance().compareTo(new BigDecimal("5000.00")) == 0 &&
                        account.getInitialBalance().compareTo(new BigDecimal("5000.00")) == 0
        ));
    }

    @Test
    void update_shouldOnlyChangeName() {
        Account account = Account.builder()
                .id(1L)
                .name("Old Name")
                .currentBalance(new BigDecimal("1000.00"))
                .user(user)
                .build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(accountRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(accountMapper.toResponse(any())).thenReturn(new AccountResponse());

        AccountRequest request = new AccountRequest();
        request.setName("New Name");

        accountService.update(1L, request);

        assertEquals("New Name", account.getName());
        assertEquals(new BigDecimal("1000.00"), account.getCurrentBalance());
    }

    @Test
    void getById_shouldThrowWhenNotOwned() {
        User otherUser = User.builder().id(2L).email("other@test.com").build();
        Account account = Account.builder().id(1L).user(otherUser).build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));

        assertThrows(ResourceNotFoundException.class, () -> accountService.getById(1L));
    }

    @Test
    void delete_shouldThrowWhenNotOwned() {
        User otherUser = User.builder().id(2L).email("other@test.com").build();
        Account account = Account.builder().id(1L).user(otherUser).build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));

        assertThrows(ResourceNotFoundException.class, () -> accountService.delete(1L));
        verify(accountRepository, never()).delete(any());
    }

    @Test
    void delete_shouldSucceedWhenOwned() {
        Account account = Account.builder().id(1L).user(user).build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));

        accountService.delete(1L);

        verify(accountRepository).delete(account);
    }
}