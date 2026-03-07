package com.monthlybudget.service;

import com.monthlybudget.dto.request.CategoryRequest;
import com.monthlybudget.dto.response.CategoryResponse;
import com.monthlybudget.exception.ResourceNotFoundException;
import com.monthlybudget.mapper.CategoryMapper;
import com.monthlybudget.model.Category;
import com.monthlybudget.model.User;
import com.monthlybudget.repository.CategoryRepository;
import com.monthlybudget.security.AuthHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock private CategoryRepository categoryRepository;
    @Mock private CategoryMapper categoryMapper;
    @Mock private AuthHelper authHelper;

    @InjectMocks
    private CategoryService categoryService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@test.com").build();
    }

    @Test
    void create_shouldBuildCategoryWithAllFields() {
        when(authHelper.getCurrentUser()).thenReturn(user);
        when(categoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(categoryMapper.toResponse(any())).thenReturn(new CategoryResponse());

        CategoryRequest request = new CategoryRequest();
        request.setName("Transport");
        request.setIcon("car");
        request.setColor("#FF5733");
        request.setIsDefault(false);

        categoryService.create(request);

        verify(categoryRepository).save(argThat(cat ->
                "Transport".equals(cat.getName()) &&
                        "car".equals(cat.getIcon()) &&
                        "#FF5733".equals(cat.getColor()) &&
                        !cat.getIsDefault()
        ));
    }

    @Test
    void update_shouldModifyAllFields() {
        Category existing = Category.builder()
                .id(1L).name("Old").icon("old").color("#000").isDefault(false).user(user)
                .build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(categoryMapper.toResponse(any())).thenReturn(new CategoryResponse());

        CategoryRequest request = new CategoryRequest();
        request.setName("New");
        request.setIcon("new-icon");
        request.setColor("#FFF");
        request.setIsDefault(true);

        categoryService.update(1L, request);

        assertEquals("New", existing.getName());
        assertEquals("new-icon", existing.getIcon());
        assertEquals("#FFF", existing.getColor());
        assertTrue(existing.getIsDefault());
    }

    @Test
    void getAllForCurrentUser_shouldFilterByUserId() {
        when(authHelper.getCurrentUser()).thenReturn(user);
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of());
        when(categoryMapper.toResponseList(any())).thenReturn(List.of());

        categoryService.getAllForCurrentUser();

        verify(categoryRepository).findByUserId(1L);
    }

    @Test
    void getById_shouldThrowWhenNotOwned() {
        User otherUser = User.builder().id(2L).build();
        Category cat = Category.builder().id(1L).user(otherUser).build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat));

        assertThrows(ResourceNotFoundException.class, () -> categoryService.getById(1L));
    }
}