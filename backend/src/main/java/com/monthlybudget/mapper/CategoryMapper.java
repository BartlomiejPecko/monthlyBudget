package com.monthlybudget.mapper;

import com.monthlybudget.dto.response.CategoryResponse;
import com.monthlybudget.model.Category;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryResponse toResponse(Category category);

    List<CategoryResponse> toResponseList(List<Category> categories);
}