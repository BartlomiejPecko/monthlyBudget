package com.monthlybudget.controller;

import com.monthlybudget.dto.request.IncomeRequest;
import com.monthlybudget.dto.response.IncomeResponse;
import com.monthlybudget.service.IncomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity<List<IncomeResponse>> getAll() {
        return ResponseEntity.ok(incomeService.getAllForCurrentUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(incomeService.getById(id));
    }

    @PostMapping
    public ResponseEntity<IncomeResponse> create(@Valid @RequestBody IncomeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incomeService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody IncomeRequest request) {
        return ResponseEntity.ok(incomeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        incomeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}