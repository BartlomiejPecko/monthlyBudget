package com.monthlybudget.dto.response;

import lombok.Data;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private String icon;
    private String color;
    private Boolean isDefault;
}