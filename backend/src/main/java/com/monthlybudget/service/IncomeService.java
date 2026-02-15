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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final IncomeMapper incomeMapper;
    private final AuthHelper authHelper;

    public List<IncomeResponse> getAllForCurrentUser() {
        User user = authHelper.getCurrentUser();
        return incomeMapper.toResponseList(
                incomeRepository.findByAccountUserIdOrderByDateDesc(user.getId())
        );
    }

    public IncomeResponse getById(Long id) {
        Income income = findIncomeOwned(id);
        return incomeMapper.toResponse(income);
    }

    @Transactional
    public IncomeResponse create(IncomeRequest request) {
        User user = authHelper.getCurrentUser();

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", request.getAccountId()));
        if (!account.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Account", request.getAccountId());
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            if (!category.getUser().getId().equals(user.getId())) {
                throw new ResourceNotFoundException("Category", request.getCategoryId());
            }
        }

        Income income = Income.builder()
                .amount(request.getAmount())
                .description(request.getDescription())
                .date(request.getDate())
                .account(account)
                .category(category)
                .build();

        account.setCurrentBalance(account.getCurrentBalance().add(request.getAmount()));
        accountRepository.save(account);

        return incomeMapper.toResponse(incomeRepository.save(income));
    }

    @Transactional
    public IncomeResponse update(Long id, IncomeRequest request) {
        Income income = findIncomeOwned(id);
        Account account = income.getAccount();

        account.setCurrentBalance(account.getCurrentBalance().subtract(income.getAmount()));

        account.setCurrentBalance(account.getCurrentBalance().add(request.getAmount()));

        income.setAmount(request.getAmount());
        income.setDescription(request.getDescription());
        income.setDate(request.getDate());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            income.setCategory(category);
        } else {
            income.setCategory(null);
        }

        accountRepository.save(account);
        return incomeMapper.toResponse(incomeRepository.save(income));
    }

    @Transactional
    public void delete(Long id) {
        Income income = findIncomeOwned(id);
        Account account = income.getAccount();

        account.setCurrentBalance(account.getCurrentBalance().subtract(income.getAmount()));

        accountRepository.save(account);
        incomeRepository.delete(income);
    }

    private Income findIncomeOwned(Long id) {
        User user = authHelper.getCurrentUser();
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income", id));
        if (!income.getAccount().getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Income", id);
        }
        return income;
    }
}