package com.monthlybudget.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRequest {

    @NotBlank(message = "Account name is required")
    private String name;

    @NotNull(message = "Initial balance is required")
    @DecimalMin(value = "0.00", message = "Balance cannot be negative")
    private BigDecimal initialBalance;
}