package com.restaurant.bookingservice.controller;

import com.restaurant.bookingservice.dto.user.TableUserRequest;
import com.restaurant.bookingservice.dto.user.TableUserResponse;
import com.restaurant.bookingservice.enums.TableLocation;
import com.restaurant.bookingservice.service.TableService;
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
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/tables")
@RequiredArgsConstructor
@Tag(name = "Пользовательские столики",
        description = "Операции со столиками для обычных пользователей")
public class UserController {
    private final TableService tableService;

    @PostMapping
    @Operation(summary = "Создать столик (для пользователя)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Столик создан",
                    content = @Content(schema = @Schema(implementation = TableUserResponse.class))),
        @ApiResponse(responseCode = "400", description = "Ошибка валидации",
                    content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "409", description = "Столик с таким номером уже существует",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<Object> createTable(@Valid @RequestBody TableUserRequest request) {
        try {
            TableUserResponse response = tableService.createTableForUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "Получить все столики")
    @ApiResponse(responseCode = "200", description = "Список столиков",
            content = @Content(schema = @Schema(implementation = TableUserResponse.class)))
    public ResponseEntity<List<TableUserResponse>> getAllTables() {
        return ResponseEntity.ok(tableService.getAllTableForUser());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить столик по ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Столик найден",
                    content = @Content(schema = @Schema(implementation = TableUserResponse.class))),
        @ApiResponse(responseCode = "404", description = "Столик не найден",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<TableUserResponse> getTableById(
            @Parameter(description = "ID столика") @PathVariable Long id) {
        TableUserResponse response = tableService.getTableByIdForUser(id);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить столик")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Столик обновлен",
                    content = @Content(schema = @Schema(implementation = TableUserResponse.class))),
        @ApiResponse(responseCode = "400", description = "Ошибка валидации",
                    content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "404", description = "Столик не найден",
                    content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "409", description = "Столик с таким номером уже существует",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<TableUserResponse> updateTable(
            @Parameter(description = "ID столика") @PathVariable Long id,
            @Valid @RequestBody TableUserRequest request) {
        TableUserResponse response = tableService.updateTableForUser(id, request);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить столик")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Столик удален"),
        @ApiResponse(responseCode = "404", description = "Столик не найден",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        boolean deleted = tableService.deleteTableForUser(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/filter")
    @Operation(summary = "Фильтрация столиков по параметрам")
    @ApiResponse(responseCode = "200", description = "Отфильтрованный список столиков",
            content = @Content(schema = @Schema(implementation = TableUserResponse.class)))
    public ResponseEntity<List<TableUserResponse>> getTableByFilter(
            @Parameter(description = "Минимальная вместимость")
            @RequestParam(required = false) Integer minCapacity,
            @Parameter(description = "Расположение")
            @RequestParam(required = false) TableLocation location,
            @Parameter(description = "Доступность")
            @RequestParam(required = false) Boolean available) {
        return ResponseEntity.ok(tableService.getTableByFilterForUser(
                minCapacity, location, available));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}