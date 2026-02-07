package com.monthlybudget.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ExpenseResponse {
    private Long id;
    private BigDecimal amount;
    private String description;
    private LocalDate date;
    private Boolean isReturn;
    private LocalDateTime createdAt;
    private Long accountId;
    private String accountName;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
}