package com.monthlybudget.service;

import com.monthlybudget.dto.request.IncomeRequest;
import com.monthlybudget.dto.response.IncomeResponse;
import com.monthlybudget.exception.ResourceNotFoundException;
import com.monthlybudget.mapper.IncomeMapper;
import com.monthlybudget.model.Account;
import com.monthlybudget.model.Category;
import com.monthlybudget.model.Income;
import com.monthlybudget.model.User;
import com.monthlybudget.repository.AccountRepository;
import com.monthlybudget.repository.CategoryRepository;
import com.monthlybudget.repository.IncomeRepository;
import com.monthlybudget.security.AuthHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncomeServiceTest {

    @Mock private IncomeRepository incomeRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private IncomeMapper incomeMapper;
    @Mock private AuthHelper authHelper;

    @InjectMocks
    private IncomeService incomeService;

    private User user;
    private Account account;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@test.com").build();
        account = Account.builder()
                .id(1L)
                .name("Main")
                .currentBalance(new BigDecimal("1000.00"))
                .user(user)
                .build();
    }

    @Test
    void create_shouldAddToBalance() {
        when(authHelper.getCurrentUser()).thenReturn(user);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(incomeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(incomeMapper.toResponse(any())).thenReturn(new IncomeResponse());

        IncomeRequest request = new IncomeRequest();
        request.setAmount(new BigDecimal("500.00"));
        request.setDescription("Salary");
        request.setDate(LocalDate.now());
        request.setAccountId(1L);
        request.setCategoryId(null);

        incomeService.create(request);

        assertEquals(new BigDecimal("1500.00"), account.getCurrentBalance());
        verify(accountRepository).save(account);
    }

    @Test
    void create_shouldThrowWhenAccountNotOwned() {
        User otherUser = User.builder().id(2L).email("other@test.com").build();
        Account otherAccount = Account.builder().id(2L).user(otherUser).build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(accountRepository.findById(2L)).thenReturn(Optional.of(otherAccount));

        IncomeRequest request = new IncomeRequest();
        request.setAccountId(2L);

        assertThrows(ResourceNotFoundException.class, () -> incomeService.create(request));
    }

    @Test
    void delete_shouldSubtractFromBalance() {
        Income income = Income.builder()
                .id(1L)
                .amount(new BigDecimal("500.00"))
                .account(account)
                .build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(incomeRepository.findById(1L)).thenReturn(Optional.of(income));

        incomeService.delete(1L);

        assertEquals(new BigDecimal("500.00"), account.getCurrentBalance());
        verify(incomeRepository).delete(income);
    }

    @Test
    void update_shouldReverseOldAndApplyNewBalance() {
        Income income = Income.builder()
                .id(1L)
                .amount(new BigDecimal("500.00"))
                .account(account)
                .build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(incomeRepository.findById(1L)).thenReturn(Optional.of(income));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(incomeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(incomeMapper.toResponse(any())).thenReturn(new IncomeResponse());

        IncomeRequest request = new IncomeRequest();
        request.setAmount(new BigDecimal("800.00"));
        request.setDescription("Updated salary");
        request.setDate(LocalDate.now());
        request.setAccountId(1L);
        request.setCategoryId(null);

        incomeService.update(1L, request);
        assertEquals(new BigDecimal("1300.00"), account.getCurrentBalance());
    }

    @Test
    void update_shouldHandleAccountChange() {
        Account newAccount = Account.builder()
                .id(2L)
                .name("Savings")
                .currentBalance(new BigDecimal("2000.00"))
                .user(user)
                .build();

        Income income = Income.builder()
                .id(1L)
                .amount(new BigDecimal("500.00"))
                .account(account)
                .build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(incomeRepository.findById(1L)).thenReturn(Optional.of(income));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(newAccount));
        when(incomeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(incomeMapper.toResponse(any())).thenReturn(new IncomeResponse());

        IncomeRequest request = new IncomeRequest();
        request.setAmount(new BigDecimal("500.00"));
        request.setDescription("Moved");
        request.setDate(LocalDate.now());
        request.setAccountId(2L);
        request.setCategoryId(null);

        incomeService.update(1L, request);

        assertEquals(new BigDecimal("500.00"), account.getCurrentBalance());
        assertEquals(new BigDecimal("2500.00"), newAccount.getCurrentBalance());
    }

    @Test
    void getById_shouldThrowWhenNotOwned() {
        User otherUser = User.builder().id(2L).email("other@test.com").build();
        Account otherAccount = Account.builder().id(2L).user(otherUser).build();
        Income income = Income.builder().id(1L).account(otherAccount).build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(incomeRepository.findById(1L)).thenReturn(Optional.of(income));

        assertThrows(ResourceNotFoundException.class, () -> incomeService.getById(1L));
    }
}