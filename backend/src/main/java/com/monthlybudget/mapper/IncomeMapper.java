package com.monthlybudget.mapper;

import com.monthlybudget.dto.response.IncomeResponse;
import com.monthlybudget.model.Income;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface IncomeMapper {

    @Mapping(source = "account.id", target = "accountId")
    @Mapping(source = "account.name", target = "accountName")
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "category.color", target = "categoryColor")
    //@Mapping(source = "category.icon", target = "categoryIcon")
    IncomeResponse toResponse(Income income);

    List<IncomeResponse> toResponseList(List<Income> incomes);
}