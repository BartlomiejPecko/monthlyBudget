package com.monthlybudget.service;

import com.monthlybudget.dto.request.GoalRequest;
import com.monthlybudget.dto.response.GoalResponse;
import com.monthlybudget.exception.ResourceNotFoundException;
import com.monthlybudget.mapper.GoalMapper;
import com.monthlybudget.model.Category;
import com.monthlybudget.model.Goal;
import com.monthlybudget.model.User;
import com.monthlybudget.repository.CategoryRepository;
import com.monthlybudget.repository.GoalRepository;
import com.monthlybudget.security.AuthHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock private GoalRepository goalRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private GoalMapper goalMapper;
    @Mock private AuthHelper authHelper;

    @InjectMocks
    private GoalService goalService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@test.com").build();
    }

    @Test
    void create_shouldSetCurrentAmountToZero() {
        when(authHelper.getCurrentUser()).thenReturn(user);
        when(goalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(goalMapper.toResponse(any())).thenReturn(new GoalResponse());

        GoalRequest request = new GoalRequest();
        request.setName("Vacation");
        request.setTargetAmount(new BigDecimal("5000.00"));
        request.setDeadline(LocalDate.of(2026, 12, 31));
        request.setCategoryId(null);

        goalService.create(request);

        verify(goalRepository).save(argThat(goal ->
                goal.getCurrentAmount().compareTo(BigDecimal.ZERO) == 0 &&
                        goal.getTargetAmount().compareTo(new BigDecimal("5000.00")) == 0
        ));
    }

    @Test
    void create_withCategory_shouldLinkCategory() {
        Category category = Category.builder().id(1L).name("Travel").user(user).build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(goalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(goalMapper.toResponse(any())).thenReturn(new GoalResponse());

        GoalRequest request = new GoalRequest();
        request.setName("Vacation");
        request.setTargetAmount(new BigDecimal("5000.00"));
        request.setDeadline(LocalDate.of(2026, 12, 31));
        request.setCategoryId(1L);

        goalService.create(request);

        verify(goalRepository).save(argThat(goal ->
                goal.getCategory() != null &&
                        goal.getCategory().getId().equals(1L)
        ));
    }

    @Test
    void update_shouldUpdateCurrentAmountWhenProvided() {
        Goal goal = Goal.builder()
                .id(1L)
                .name("Old")
                .targetAmount(new BigDecimal("1000.00"))
                .currentAmount(BigDecimal.ZERO)
                .user(user)
                .build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(goalRepository.findById(1L)).thenReturn(Optional.of(goal));
        when(goalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(goalMapper.toResponse(any())).thenReturn(new GoalResponse());

        GoalRequest request = new GoalRequest();
        request.setName("Updated");
        request.setTargetAmount(new BigDecimal("2000.00"));
        request.setDeadline(LocalDate.of(2026, 12, 31));
        request.setCurrentAmount(new BigDecimal("500.00"));
        request.setCategoryId(null);

        goalService.update(1L, request);

        assertEquals(new BigDecimal("500.00"), goal.getCurrentAmount());
        assertEquals(new BigDecimal("2000.00"), goal.getTargetAmount());
    }

    @Test
    void update_shouldClearCategoryWhenNull() {
        Category oldCat = Category.builder().id(1L).user(user).build();
        Goal goal = Goal.builder()
                .id(1L).name("G").targetAmount(BigDecimal.TEN)
                .currentAmount(BigDecimal.ZERO).user(user).category(oldCat)
                .build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(goalRepository.findById(1L)).thenReturn(Optional.of(goal));
        when(goalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(goalMapper.toResponse(any())).thenReturn(new GoalResponse());

        GoalRequest request = new GoalRequest();
        request.setName("G");
        request.setTargetAmount(BigDecimal.TEN);
        request.setDeadline(LocalDate.now());
        request.setCategoryId(null); // clear category

        goalService.update(1L, request);

        assertNull(goal.getCategory());
    }

    @Test
    void getById_shouldThrowWhenNotOwned() {
        User other = User.builder().id(2L).build();
        Goal goal = Goal.builder().id(1L).user(other).build();

        when(authHelper.getCurrentUser()).thenReturn(user);
        when(goalRepository.findById(1L)).thenReturn(Optional.of(goal));

        assertThrows(ResourceNotFoundException.class, () -> goalService.getById(1L));
    }
}