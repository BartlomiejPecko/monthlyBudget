package com.monthlybudget.service;

import com.monthlybudget.dto.request.CategoryRequest;
import com.monthlybudget.dto.response.CategoryResponse;
import com.monthlybudget.exception.ResourceNotFoundException;
import com.monthlybudget.mapper.CategoryMapper;
import com.monthlybudget.model.Category;
import com.monthlybudget.model.User;
import com.monthlybudget.repository.CategoryRepository;
import com.monthlybudget.security.AuthHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final AuthHelper authHelper;

    public List<CategoryResponse> getAllForCurrentUser() {
        User user = authHelper.getCurrentUser();
        return categoryMapper.toResponseList(categoryRepository.findByUserId(user.getId()));
    }

    public CategoryResponse getById(Long id) {
        Category category = findCategoryOwned(id);
        return categoryMapper.toResponse(category);
    }

    public CategoryResponse create(CategoryRequest request) {
        User user = authHelper.getCurrentUser();

        Category category = Category.builder()
                .name(request.getName())
                .icon(request.getIcon())
                .color(request.getColor())
                .isDefault(request.getIsDefault())
                .user(user)
                .build();

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findCategoryOwned(id);
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        category.setIsDefault(request.getIsDefault());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    public void delete(Long id) {
        Category category = findCategoryOwned(id);
        categoryRepository.delete(category);
    }

    private Category findCategoryOwned(Long id) {
        User user = authHelper.getCurrentUser();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Category", id);
        }
        return category;
    }
}