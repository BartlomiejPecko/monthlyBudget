package com.monthlybudget.repository;

import com.monthlybudget.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByAccountId(Long accountId);
    List<Expense> findByAccountUserIdAndDateBetween(Long userId, LocalDate from, LocalDate to);
    List<Expense> findByCategoryId(Long categoryId);
    List<Expense> findByAccountUserIdOrderByDateDesc(Long userId);
}
