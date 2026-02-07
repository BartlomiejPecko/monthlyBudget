package com.monthlybudget.service;

import com.monthlybudget.dto.request.AccountRequest;
import com.monthlybudget.dto.response.AccountResponse;
import com.monthlybudget.exception.ResourceNotFoundException;
import com.monthlybudget.mapper.AccountMapper;
import com.monthlybudget.model.Account;
import com.monthlybudget.model.User;
import com.monthlybudget.repository.AccountRepository;
import com.monthlybudget.security.AuthHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;
    private final AuthHelper authHelper;

    public List<AccountResponse> getAllForCurrentUser() {
        User user = authHelper.getCurrentUser();
        return accountMapper.toResponseList(accountRepository.findByUserId(user.getId()));
    }

    public AccountResponse getById(Long id) {
        Account account = findAccountOwned(id);
        return accountMapper.toResponse(account);
    }

    public AccountResponse create(AccountRequest request) {
        User user = authHelper.getCurrentUser();

        Account account = Account.builder()
                .name(request.getName())
                .initialBalance(request.getInitialBalance())
                .currentBalance(request.getInitialBalance())
                .user(user)
                .build();

        return accountMapper.toResponse(accountRepository.save(account));
    }

    public AccountResponse update(Long id, AccountRequest request) {
        Account account = findAccountOwned(id);
        account.setName(request.getName());
        return accountMapper.toResponse(accountRepository.save(account));
    }

    public void delete(Long id) {
        Account account = findAccountOwned(id);
        accountRepository.delete(account);
    }

    private Account findAccountOwned(Long id) {
        User user = authHelper.getCurrentUser();
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", id));
        if (!account.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Account", id);
        }
        return account;
    }
}