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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseMapper expenseMapper;
    private final AuthHelper authHelper;

    public List<ExpenseResponse> getAllForCurrentUser() {
        User user = authHelper.getCurrentUser();
        return expenseMapper.toResponseList(
                expenseRepository.findByAccountUserIdOrderByDateDesc(user.getId())
        );
    }

    public ExpenseResponse getById(Long id) {
        Expense expense = findExpenseOwned(id);
        return expenseMapper.toResponse(expense);
    }

    @Transactional
    public ExpenseResponse create(ExpenseRequest request) {
        User user = authHelper.getCurrentUser();

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", request.getAccountId()));
        if (!account.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Account", request.getAccountId());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Category", request.getCategoryId());
        }

        Expense expense = Expense.builder()
                .amount(request.getAmount())
                .description(request.getDescription())
                .date(request.getDate())
                .isReturn(request.getIsReturn() != null && request.getIsReturn())
                .account(account)
                .category(category)
                .build();

        // Aktualizacja salda konta
        if (Boolean.TRUE.equals(expense.getIsReturn())) {
            account.setCurrentBalance(account.getCurrentBalance().add(request.getAmount()));
        } else {
            account.setCurrentBalance(account.getCurrentBalance().subtract(request.getAmount()));
        }
        accountRepository.save(account);

        return expenseMapper.toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse update(Long id, ExpenseRequest request) {
        Expense expense = findExpenseOwned(id);
        Account account = expense.getAccount();

        // Cofnij stary wpływ na saldo
        if (Boolean.TRUE.equals(expense.getIsReturn())) {
            account.setCurrentBalance(account.getCurrentBalance().subtract(expense.getAmount()));
        } else {
            account.setCurrentBalance(account.getCurrentBalance().add(expense.getAmount()));
        }

        // Zastosuj nowy
        boolean newIsReturn = request.getIsReturn() != null && request.getIsReturn();
        if (newIsReturn) {
            account.setCurrentBalance(account.getCurrentBalance().add(request.getAmount()));
        } else {
            account.setCurrentBalance(account.getCurrentBalance().subtract(request.getAmount()));
        }

        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setDate(request.getDate());
        expense.setIsReturn(newIsReturn);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        expense.setCategory(category);

        accountRepository.save(account);
        return expenseMapper.toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public void delete(Long id) {
        Expense expense = findExpenseOwned(id);
        Account account = expense.getAccount();

        // Cofnij wpływ na saldo
        if (Boolean.TRUE.equals(expense.getIsReturn())) {
            account.setCurrentBalance(account.getCurrentBalance().subtract(expense.getAmount()));
        } else {
            account.setCurrentBalance(account.getCurrentBalance().add(expense.getAmount()));
        }

        accountRepository.save(account);
        expenseRepository.delete(expense);
    }

    private Expense findExpenseOwned(Long id) {
        User user = authHelper.getCurrentUser();
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", id));
        if (!expense.getAccount().getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Expense", id);
        }
        return expense;
    }
}