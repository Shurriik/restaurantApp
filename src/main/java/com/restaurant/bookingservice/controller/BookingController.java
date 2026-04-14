package com.restaurant.bookingservice.controller;

import com.restaurant.bookingservice.dto.booking.BookingBulkRequest;
import com.restaurant.bookingservice.dto.booking.BookingBulkResponse;
import com.restaurant.bookingservice.dto.booking.BookingResponse;
import com.restaurant.bookingservice.dto.booking.CompleteBookingRequest;
import com.restaurant.bookingservice.enums.BookingStatus;
import com.restaurant.bookingservice.model.Booking;
import com.restaurant.bookingservice.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
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

@Slf4j
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Бронирования", description = "Управление бронированиями столиков")
public class BookingController {
    private final BookingService bookingService;

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex) {
        log.error("Некорректный формат запроса: {}", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Bad Request");

        String message = "Некорректный формат запроса. ";

        if (ex.getMessage().contains("START_ARRAY")) {
            message += "Ожидается объект с полем 'bookings'."
                    + "Правильный формат: { \"bookings\": [...] }";
        } else if (ex.getMessage().contains("START_OBJECT")) {
            message += "Ожидается массив, но получен объект.";
        } else {
            message += "Проверьте структуру JSON запроса.";
        }

        response.put("message", message);
        response.put("expectedFormat", "{ \"bookings\": [ { ... } ] }");

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @PostMapping
    @Operation(summary = "Создать новое бронирование")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Бронирование создано",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "409", description = "Стол занят",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<String> createBooking(
            @Valid @RequestBody CompleteBookingRequest request) {
        try {
            Booking booking = bookingService.createBooking(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Бронирование создано. ID: " + booking.getId());
        } catch (RuntimeException e) {
            log.error("Ошибка при создании бронирования: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить бронирование по ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Бронирование найдено",
                    content = @Content(schema = @Schema(implementation = Booking.class))),
            @ApiResponse(responseCode = "404", description = "Бронирование не найдено",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<Booking> getBookingById(
            @Parameter(description = "ID бронирования") @PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @GetMapping
    @Operation(summary = "Получить все бронирования")
    @ApiResponse(responseCode = "200", description = "Список бронирований",
            content = @Content(schema = @Schema(implementation = Booking.class)))
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить бронирование")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Бронирование обновлено",
                    content = @Content(schema = @Schema(implementation = Booking.class))),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "Бронирование не найдено",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<Booking> updateBooking(
            @Parameter(description = "ID бронирования") @PathVariable Long id,
            @Valid @RequestBody CompleteBookingRequest request) {
        Booking booking = bookingService.updateBooking(id, request);
        return ResponseEntity.ok(booking);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить бронирование")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Бронирование удалено"),
            @ApiResponse(responseCode = "404", description = "Бронирование не найдено",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/demonstrate/with-transaction")
    @Operation(summary = "Демонстрация транзакции (с ошибкой)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Операция выполнена успешно",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "400", description = "Ошибка с откатом транзакции",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<String> createWithTransaction(
            @Valid @RequestBody CompleteBookingRequest request) {
        try {
            bookingService.createBookingWithTransaction(request);
            return ResponseEntity.ok("TX DEMO - END (committed)");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage() + " - транзакция откачена");
        }
    }

    @PostMapping("/demonstrate/without-transaction")
    @Operation(summary = "Демонстрация без транзакции (с ошибкой)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Операция выполнена успешно",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "400", description = "Ошибка с частичным сохранением",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<String> createWithoutTransaction(
            @Valid @RequestBody CompleteBookingRequest request) {
        try {
            bookingService.createBookingWithoutTransaction(request);
            return ResponseEntity.ok("NO-TX DEMO - END (success)");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage() + " - данные сохранены в БД");
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Поиск бронирований по критериям (JPQL)")
    @ApiResponse(responseCode = "200", description = "Результаты поиска",
            content = @Content(schema = @Schema(implementation = BookingResponse.class)))
    public ResponseEntity<List<BookingResponse>> searchBookings(
            @RequestParam(required = false, defaultValue = "") String customerName,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate) {

        if (startDate == null) {
            startDate = LocalDateTime.now().minusYears(1);
        }
        if (status == null) {
            status = BookingStatus.CONFIRMED;
        }
        if (minCapacity == null) {
            minCapacity = 1;
        }

        List<BookingResponse> result = bookingService.findBookingsByComplexCriteria(
                "%" + customerName + "%", minCapacity, status, startDate);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/search-native")
    @Operation(summary = "Поиск бронирований по критериям (Native SQL)")
    @ApiResponse(responseCode = "200", description = "Результаты поиска",
            content = @Content(schema = @Schema(implementation = BookingResponse.class)))
    public ResponseEntity<List<BookingResponse>> searchBookingsNative(
            @RequestParam(required = false, defaultValue = "") String customerName,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate) {

        if (startDate == null) {
            startDate = LocalDateTime.now().minusYears(1);
        }
        if (status == null) {
            status = BookingStatus.CONFIRMED;
        }
        if (minCapacity == null) {
            minCapacity = 1;
        }

        List<BookingResponse> result = bookingService.findBookingsByComplexCriteriaNative(
                "%" + customerName + "%", minCapacity, status, startDate);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/search-paginated")
    @Operation(summary = "Поиск бронирований с пагинацией")
    @ApiResponse(responseCode = "200", description = "Страница результатов",
            content = @Content(schema = @Schema(implementation = Page.class)))
    public ResponseEntity<Page<BookingResponse>> searchBookingsPaginated(
            @RequestParam(required = false, defaultValue = "") String customerName,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        if (status == null) {
            status = BookingStatus.CONFIRMED;
        }
        if (minCapacity == null) {
            minCapacity = 1;
        }

        Page<BookingResponse> result = bookingService.findBookingsWithPagination(
                "%" + customerName + "%", minCapacity, status, page, size, sortBy, sortDirection);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/cache/size")
    @Operation(summary = "Получить размер кэша")
    @ApiResponse(responseCode = "200", description = "Размер кэша",
            content = @Content(schema = @Schema(implementation = Integer.class)))
    public ResponseEntity<Integer> getCacheSize() {
        return ResponseEntity.ok(bookingService.getCacheSize());
    }

    @DeleteMapping("/cache/clear")
    @Operation(summary = "Очистить кэш")
    @ApiResponse(responseCode = "200", description = "Кэш очищен",
            content = @Content(schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> clearCache() {
        bookingService.clearCache();
        return ResponseEntity.ok("Кэш очищен");
    }

    @GetMapping("/demonstrate/nplus1")
    @Operation(summary = "Демонстрация N+1 проблемы")
    @ApiResponse(responseCode = "200", description = "Демонстрация запущена",
            content = @Content(schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> demonstrateNplus1() {
        bookingService.demonstrateNplus1Problem();
        return ResponseEntity.ok(
                "N+1 проблема для всех бронирований продемонстрирована. Проверьте логи.");
    }

    @GetMapping("/demonstrate/nplus1-solution")
    @Operation(summary = "Демонстрация решения N+1 через EntityGraph")
    @ApiResponse(responseCode = "200", description = "Демонстрация запущена",
            content = @Content(schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> demonstrateNplus1Solution() {
        bookingService.demonstrateNplus1Solution();
        return ResponseEntity.ok(
                "Решение N+1 для всех бронирований продемонстрировано. Проверьте логи.");
    }

    @GetMapping("/list")
    @Operation(summary = "Получить все бронирования с EntityGraph")
    @ApiResponse(responseCode = "200", description = "Список бронирований",
            content = @Content(schema = @Schema(implementation = BookingResponse.class)))
    public ResponseEntity<List<BookingResponse>> getAllBookingsResponse() {
        return ResponseEntity.ok(bookingService.findAllWithEntityGraph());
    }

    @PostMapping("/bulk/without-transaction")
    public ResponseEntity<BookingBulkResponse> createBookingsBulkWithoutTransaction(
            @Valid @RequestBody BookingBulkRequest request) {
        BookingBulkResponse response =
                bookingService.createBookingsWithoutTransaction(request.getBookings());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bulk/with-transaction")
    public ResponseEntity<BookingBulkResponse> createBookingsBulkWithTransaction(
            @Valid @RequestBody BookingBulkRequest request) {
        try {
            BookingBulkResponse response =
                    bookingService.createBookingsWithTransaction(request.getBookings());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            BookingBulkResponse errorResponse = BookingBulkResponse.builder()
                    .totalRequested(request.getBookings().size())
                    .successfullyCreated(0)
                    .failed(request.getBookings().size())
                    .errors(List.of(e.getMessage()))
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/bulk/stream")
    public ResponseEntity<BookingBulkResponse> createBookingsBulkWithStream(
            @Valid @RequestBody BookingBulkRequest request) {
        BookingBulkResponse response =
                bookingService.createBookingsWithStream(request.getBookings());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bulk/ids")
    public ResponseEntity<List<BookingResponse>> getBookingsByIds(
            @RequestParam List<Long> ids) {
        List<BookingResponse> bookings = bookingService.getBookingsByIds(ids);
        return ResponseEntity.ok(bookings);
    }
}