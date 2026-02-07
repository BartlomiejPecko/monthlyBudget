package com.monthlybudget.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountResponse {
    private Long id;
    private String name;
    private BigDecimal initialBalance;
    private BigDecimal currentBalance;
}