package com.restaurant.bookingservice.controller;

import com.restaurant.bookingservice.dto.menu.MenuItemRequest;
import com.restaurant.bookingservice.dto.menu.MenuItemResponse;
import com.restaurant.bookingservice.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
@Tag(name = "Меню", description = "Управление меню ресторана")
public class MenuController {
    private final MenuService menuService;

    @GetMapping
    @Operation(summary = "Получить все блюда меню")
    @ApiResponse(responseCode = "200", description = "Список блюд",
            content = @Content(schema = @Schema(implementation = MenuItemResponse.class)))
    public ResponseEntity<List<MenuItemResponse>> getAllMenuItems() {
        return ResponseEntity.ok(menuService.getAllMenuItems());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить блюдо по ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Блюдо найдено",
                    content = @Content(schema = @Schema(implementation = MenuItemResponse.class))),
        @ApiResponse(responseCode = "404", description = "Блюдо не найдено",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<MenuItemResponse> getMenuItemById(
            @Parameter(description = "ID блюда") @PathVariable Long id) {
        return ResponseEntity.ok(menuService.getMenuItemById(id));
    }

    @GetMapping("/tag/{tagId}")
    @Operation(summary = "Получить блюда по тегу")
    @ApiResponse(responseCode = "200", description = "Список блюд",
            content = @Content(schema = @Schema(implementation = MenuItemResponse.class)))
    public ResponseEntity<List<MenuItemResponse>> getMenuItemsByTagId(
            @Parameter(description = "ID тега") @PathVariable Long tagId) {
        return ResponseEntity.ok(menuService.getMenuItemsByTagId(tagId));
    }

    @PostMapping
    @Operation(summary = "Создать новое блюдо")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Блюдо создано",
                    content = @Content(schema = @Schema(implementation = MenuItemResponse.class))),
        @ApiResponse(responseCode = "400", description = "Ошибка валидации",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<MenuItemResponse> createMenuItem(
            @Valid @RequestBody MenuItemRequest request) {
        MenuItemResponse response = menuService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить блюдо")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Блюдо обновлено",
                    content = @Content(schema = @Schema(implementation = MenuItemResponse.class))),
        @ApiResponse(responseCode = "400", description = "Ошибка валидации",
                    content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "404", description = "Блюдо не найдено",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @Parameter(description = "ID блюда") @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(menuService.updateMenuItem(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить блюдо")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Блюдо удалено"),
        @ApiResponse(responseCode = "404", description = "Блюдо не найдено",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/tags")
    @Operation(summary = "Добавить теги к блюду")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Теги добавлены",
                    content = @Content(schema = @Schema(implementation = MenuItemResponse.class))),
        @ApiResponse(responseCode = "404", description = "Блюдо или тег не найдены",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<MenuItemResponse> addTagsToMenuItem(
            @Parameter(description = "ID блюда") @PathVariable Long id,
            @RequestBody List<Long> tagIds) {
        return ResponseEntity.ok(menuService.addTagsToMenuItem(id, tagIds));
    }

    @DeleteMapping("/{id}/tags")
    @Operation(summary = "Удалить теги из блюда")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Теги удалены",
                    content = @Content(schema = @Schema(implementation = MenuItemResponse.class))),
        @ApiResponse(responseCode = "404", description = "Блюдо или тег не найдены",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<MenuItemResponse> removeTagsFromMenuItem(
            @Parameter(description = "ID блюда") @PathVariable Long id,
            @RequestBody List<Long> tagIds) {
        return ResponseEntity.ok(menuService.removeTagsFromMenuItem(id, tagIds));
    }
}