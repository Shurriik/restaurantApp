package com.restaurant.bookingservice.controller;

import com.restaurant.bookingservice.dto.tag.TagRequest;
import com.restaurant.bookingservice.dto.tag.TagResponse;
import com.restaurant.bookingservice.service.TagService;
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
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "Теги", description = "Управление тегами для блюд")
public class TagController {
    private final TagService tagService;

    @GetMapping
    @Operation(summary = "Получить все теги")
    @ApiResponse(responseCode = "200", description = "Список тегов",
            content = @Content(schema = @Schema(implementation = TagResponse.class)))
    public ResponseEntity<List<TagResponse>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить тег по ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Тег найден",
                    content = @Content(schema = @Schema(implementation = TagResponse.class))),
        @ApiResponse(responseCode = "404", description = "Тег не найден",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<TagResponse> getTagById(
            @Parameter(description = "ID тега") @PathVariable Long id) {
        return ResponseEntity.ok(tagService.getTagById(id));
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Получить тег по названию")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Тег найден",
                    content = @Content(schema = @Schema(implementation = TagResponse.class))),
        @ApiResponse(responseCode = "404", description = "Тег не найден",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<TagResponse> getTagByName(
            @Parameter(description = "Название тега") @PathVariable String name) {
        return ResponseEntity.ok(tagService.getTagByName(name));
    }

    @GetMapping("/with-menu-items")
    @Operation(summary = "Получить теги, которые используются в блюдах")
    @ApiResponse(responseCode = "200", description = "Список тегов",
            content = @Content(schema = @Schema(implementation = TagResponse.class)))
    public ResponseEntity<List<TagResponse>> getTagsWithMenuItems() {
        return ResponseEntity.ok(tagService.getTagsWithMenuItems());
    }

    @GetMapping("/without-menu-items")
    @Operation(summary = "Получить теги, которые не используются в блюдах")
    @ApiResponse(responseCode = "200", description = "Список тегов",
            content = @Content(schema = @Schema(implementation = TagResponse.class)))
    public ResponseEntity<List<TagResponse>> getTagsWithoutMenuItems() {
        return ResponseEntity.ok(tagService.getTagsWithoutMenuItems());
    }

    @PostMapping
    @Operation(summary = "Создать новый тег")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Тег создан",
                    content = @Content(schema = @Schema(implementation = TagResponse.class))),
        @ApiResponse(responseCode = "400", description = "Ошибка валидации",
                    content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "409", description = "Тег с таким названием уже существует",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<TagResponse> createTag(@Valid @RequestBody TagRequest request) {
        TagResponse response = tagService.createTag(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить тег")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Тег обновлен",
                    content = @Content(schema = @Schema(implementation = TagResponse.class))),
        @ApiResponse(responseCode = "400", description = "Ошибка валидации",
                    content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "404", description = "Тег не найден",
                    content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "409", description = "Тег с таким названием уже существует",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<TagResponse> updateTag(
            @Parameter(description = "ID тега") @PathVariable Long id,
            @Valid @RequestBody TagRequest request) {
        return ResponseEntity.ok(tagService.updateTag(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить тег")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Тег удален"),
        @ApiResponse(responseCode = "404", description = "Тег не найден",
                    content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "409", description = "Тег используется в блюдах",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}