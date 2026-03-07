package com.monthlybudget.service;

import com.monthlybudget.dto.request.ExpenseRequest;
import com.monthlybudget.dto.response.ExpenseResponse;
import com.monthlybudget.exception.ResourceNotFoundException;
import com.monthlybudget.mapper.ExpenseMapper;
import com.monthlybudget.model.Account;
import com.monthlybudget.model.Category;
import com.monthlybudget.model.Expense;
import com.monthlybudget.model.User;
import com.monthlybudget.repository.AccountRepository;
import com.monthlybudget.repository.CategoryRepository;
import com.monthlybudget.repository.ExpenseRepository;
import com.monthlybudget.security.AuthHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock private ExpenseRepository expenseRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private ExpenseMapper expenseMapper;
    @Mock private AuthHelper authHelper;

    @InjectMocks
    private ExpenseService expenseService;

    private User user;
    private Account account;
    private Category category;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@test.com").build();
        account = Account.builder()
                .id(1L)
                .name("Main")
                .currentBalance(new BigDecimal("1000.00"))
                .user(user)
                .build();
        category = Category.builder().id(1L).name("Food").user(user).build();
    }

    // --- CREATE ---

    @Test
    void create_shouldSubtractFromBalance() {
        when(authHelper.getCurrentUser()).thenReturn(user);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(expenseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(expenseMapper.toResponse(any())).thenReturn(new ExpenseResponse());

        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("200.00"));
        request.setDescription("Groceries");
        request.setDate(LocalDate.now());
        request.setIsReturn(false);
        request.setAccountId(1L);
        request.setCategoryId(1L);

        expenseService.create(request);

        assertEquals(new BigDecimal("800.00"), account.getCurrentBalance());
        verify(accountRepository).save(account);
    }

    @Test
    void create_withReturnFlag_shouldAddToBalance() {
        when(authHelper.getCurrentUser()).thenReturn(user);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(expenseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(expenseMapper.toResponse(any())).thenReturn(new ExpenseResponse());

        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("50.00"));
        request.setDescription("Refund");
        request.setDate(LocalDate.now());
        request.setIsReturn(true);
        request.setAccountId(1L);
        request.setCategoryId(1L);

        expenseService.create(request);

        assertEquals(new BigDecimal("1050.00"), account.getCurrentBalance());
    }

    @Test
    void create_shouldThrowWhenAccountNotOwnedByUser() {
        User otherUser = User.builder().id(2L).email("other@test.com").build();
        Account otherAccount = Account.builder().id(2L).user(otherUser).build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(accountRepository.findById(2L)).thenReturn(Optional.of(otherAccount));

        ExpenseRequest request = new ExpenseRequest();
        request.setAccountId(2L);
        request.setCategoryId(1L);

        assertThrows(ResourceNotFoundException.class, () -> expenseService.create(request));
    }

    @Test
    void create_shouldThrowWhenCategoryNotOwnedByUser() {
        User otherUser = User.builder().id(2L).email("other@test.com").build();
        Category otherCategory = Category.builder().id(2L).user(otherUser).build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(otherCategory));

        ExpenseRequest request = new ExpenseRequest();
        request.setAccountId(1L);
        request.setCategoryId(2L);

        assertThrows(ResourceNotFoundException.class, () -> expenseService.create(request));
    }

    // --- DELETE ---

    @Test
    void delete_shouldReverseBalanceSubtraction() {
        Expense expense = Expense.builder()
                .id(1L)
                .amount(new BigDecimal("200.00"))
                .isReturn(false)
                .account(account)
                .build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));

        expenseService.delete(1L);

        // Deleting a normal expense should ADD back to balance
        assertEquals(new BigDecimal("1200.00"), account.getCurrentBalance());
        verify(expenseRepository).delete(expense);
    }

    @Test
    void delete_shouldReverseReturnAddition() {
        Expense expense = Expense.builder()
                .id(1L)
                .amount(new BigDecimal("50.00"))
                .isReturn(true)
                .account(account)
                .build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));

        expenseService.delete(1L);

        // Deleting a return should SUBTRACT from balance
        assertEquals(new BigDecimal("950.00"), account.getCurrentBalance());
    }

    @Test
    void delete_shouldThrowWhenExpenseNotOwned() {
        User otherUser = User.builder().id(2L).email("other@test.com").build();
        Account otherAccount = Account.builder().id(2L).user(otherUser).build();
        Expense expense = Expense.builder().id(1L).account(otherAccount).build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));

        assertThrows(ResourceNotFoundException.class, () -> expenseService.delete(1L));
    }

    // --- UPDATE ---

    @Test
    void update_shouldReverseOldAndApplyNewBalance() {
        Expense expense = Expense.builder()
                .id(1L)
                .amount(new BigDecimal("200.00"))
                .isReturn(false)
                .account(account)
                .build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(expenseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(expenseMapper.toResponse(any())).thenReturn(new ExpenseResponse());

        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("300.00"));
        request.setDescription("Updated");
        request.setDate(LocalDate.now());
        request.setIsReturn(false);
        request.setAccountId(1L);
        request.setCategoryId(1L);

        expenseService.update(1L, request);

        // Start: 1000, reverse old (-200 → +200 = 1200), apply new (-300 = 900)
        assertEquals(new BigDecimal("900.00"), account.getCurrentBalance());
    }

    @Test
    void update_shouldHandleReturnToNonReturnSwitch() {
        Expense expense = Expense.builder()
                .id(1L)
                .amount(new BigDecimal("100.00"))
                .isReturn(true)  // was a return
                .account(account)
                .build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(expenseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(expenseMapper.toResponse(any())).thenReturn(new ExpenseResponse());

        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("100.00"));
        request.setDescription("No longer return");
        request.setDate(LocalDate.now());
        request.setIsReturn(false); // now a normal expense
        request.setAccountId(1L);
        request.setCategoryId(1L);

        expenseService.update(1L, request);

        // Start: 1000, reverse old return (-100 = 900), apply new expense (-100 = 800)
        assertEquals(new BigDecimal("800.00"), account.getCurrentBalance());
    }

    // --- GET ---

    @Test
    void getAllForCurrentUser_shouldReturnMappedList() {
        when(authHelper.getCurrentUser()).thenReturn(user);
        when(expenseRepository.findByAccountUserIdOrderByDateDescIdDesc(1L))
                .thenReturn(List.of());
        when(expenseMapper.toResponseList(any())).thenReturn(List.of());

        List<ExpenseResponse> result = expenseService.getAllForCurrentUser();

        assertNotNull(result);
        verify(expenseRepository).findByAccountUserIdOrderByDateDescIdDesc(1L);
    }

    @Test
    void getById_shouldThrowWhenNotFound() {
        when(authHelper.getCurrentUser()).thenReturn(user);
        when(expenseRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> expenseService.getById(999L));
    }
}