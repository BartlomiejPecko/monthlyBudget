package com.monthlybudget.repository;

import com.monthlybudget.model.Income;
import org.mapstruct.Mapper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.LocalDate;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByAccountId(Long accountId);
    List<Income> findByAccountUserIdOrderByDateDesc(Long userId);
    List<Income> findByAccountUserIdAndDateBetween(Long userId, LocalDate from, LocalDate to);
    List<Income> findByCategoryId(Long categoryId);
}