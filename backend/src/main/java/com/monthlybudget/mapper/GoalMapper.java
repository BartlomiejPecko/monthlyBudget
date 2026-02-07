package com.monthlybudget.mapper;

import com.monthlybudget.dto.response.GoalResponse;
import com.monthlybudget.model.Goal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Mapper(componentModel = "spring")
public interface GoalMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = ".", target = "progressPercentage", qualifiedByName = "calcProgress")
    GoalResponse toResponse(Goal goal);

    List<GoalResponse> toResponseList(List<Goal> goals);

    @Named("calcProgress")
    default Double calcProgress(Goal goal) {
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return goal.getCurrentAmount()
                .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }
}