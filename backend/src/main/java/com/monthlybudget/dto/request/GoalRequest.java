package com.monthlybudget.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GoalRequest {

    @Getter
    @Setter
    private BigDecimal currentAmount;

    @NotBlank(message = "Goal name is required")
    private String name;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "0.01", message = "Target must be greater than 0")
    private BigDecimal targetAmount;

    private LocalDate deadline;
    private Long categoryId;
}