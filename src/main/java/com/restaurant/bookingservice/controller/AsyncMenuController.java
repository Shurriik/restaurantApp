package com.restaurant.bookingservice.controller;

import com.restaurant.bookingservice.dto.async.AsyncTaskResponse;
import com.restaurant.bookingservice.dto.menu.MenuItemRequest;
import com.restaurant.bookingservice.service.AsyncMenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/async/menu")
@RequiredArgsConstructor
@Tag(name = "Асинхронное меню", description = "Асинхронное добавление блюд")
public class AsyncMenuController {

    private final AsyncMenuService asyncMenuService;

    @PostMapping("/items")
    @Operation(summary = "Асинхронное создание блюда")
    public ResponseEntity<AsyncTaskResponse> createMenuItemAsync(
            @RequestBody MenuItemRequest request) {
        String taskId = asyncMenuService.createMenuItemAsync(request);

        AsyncTaskResponse response = AsyncTaskResponse.builder()
                .taskId(taskId)
                .status("ACCEPTED")
                .createdAt(LocalDateTime.now())
                .build();

        return ResponseEntity.accepted().body(response);
    }

    @GetMapping("/tasks/{taskId}")
    @Operation(summary = "Проверка статуса асинхронной задачи")
    public ResponseEntity<AsyncTaskResponse> getTaskStatus(@PathVariable String taskId) {
        AsyncTaskResponse response = asyncMenuService.getTaskStatus(taskId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tasks")
    @Operation(summary = "Получить все задачи")
    public ResponseEntity<Map<String, AsyncTaskResponse>> getAllTasks() {
        return ResponseEntity.ok(asyncMenuService.getAllTasks());
    }
}