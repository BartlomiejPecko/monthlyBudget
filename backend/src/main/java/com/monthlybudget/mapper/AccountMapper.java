package com.monthlybudget.mapper;

import com.monthlybudget.dto.response.AccountResponse;
import com.monthlybudget.model.Account;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AccountMapper {

    AccountResponse toResponse(Account account);

    List<AccountResponse> toResponseList(List<Account> accounts);
}