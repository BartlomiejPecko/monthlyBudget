package com.monthlybudget.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.monthlybudget.model.Category;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserId(Long userId);
    List<Category> findByUserIdAndIsDefaultTrue(Long userId);


}
