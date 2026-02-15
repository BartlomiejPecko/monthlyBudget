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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final CategoryRepository categoryRepository;
    private final GoalMapper goalMapper;
    private final AuthHelper authHelper;

    public List<GoalResponse> getAllForCurrentUser() {
        User user = authHelper.getCurrentUser();
        return goalMapper.toResponseList(goalRepository.findByUserId(user.getId()));
    }

    public GoalResponse getById(Long id) {
        Goal goal = findGoalOwned(id);
        return goalMapper.toResponse(goal);
    }

    public GoalResponse create(GoalRequest request) {
        User user = authHelper.getCurrentUser();

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        }

        Goal goal = Goal.builder()
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .currentAmount(BigDecimal.ZERO)
                .deadline(request.getDeadline())
                .user(user)
                .category(category)
                .build();

        return goalMapper.toResponse(goalRepository.save(goal));
    }

    public GoalResponse update(Long id, GoalRequest request) {
        Goal goal = findGoalOwned(id);
        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setDeadline(request.getDeadline());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            goal.setCategory(category);
        } else {
            goal.setCategory(null);
        }

        if (request.getCurrentAmount() != null) {
            goal.setCurrentAmount(request.getCurrentAmount());
        }

        return goalMapper.toResponse(goalRepository.save(goal));
    }

    public void delete(Long id) {
        Goal goal = findGoalOwned(id);
        goalRepository.delete(goal);
    }

    private Goal findGoalOwned(Long id) {
        User user = authHelper.getCurrentUser();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", id));
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Goal", id);
        }
        return goal;
    }
}