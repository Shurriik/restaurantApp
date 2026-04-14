package com.restaurant.bookingservice.controller;

import com.restaurant.bookingservice.dto.order.OrderRequest;
import com.restaurant.bookingservice.dto.order.OrderResponse;
import com.restaurant.bookingservice.enums.OrderStatus;
import com.restaurant.bookingservice.service.OrderService;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Заказы", description = "Управление заказами")
public class OrderController {
    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Получить все заказы")
    @ApiResponse(responseCode = "200", description = "Список заказов",
            content = @Content(schema = @Schema(implementation = OrderResponse.class)))
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить заказ по ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Заказ найден",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
        @ApiResponse(responseCode = "404", description = "Заказ не найден",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<OrderResponse> getOrderById(
            @Parameter(description = "ID заказа") @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Получить заказы по ID бронирования")
    @ApiResponse(responseCode = "200", description = "Список заказов",
            content = @Content(schema = @Schema(implementation = OrderResponse.class)))
    public ResponseEntity<List<OrderResponse>> getOrdersByBookingId(
            @Parameter(description = "ID бронирования") @PathVariable Long bookingId) {
        return ResponseEntity.ok(orderService.getOrdersByBookingId(bookingId));
    }

    @PostMapping
    @Operation(summary = "Создать новый заказ")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Заказ создан",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
        @ApiResponse(responseCode = "400", description = "Ошибка валидации",
                    content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "404", description = "Бронирование или блюдо не найдены",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить заказ")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Заказ обновлен",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
        @ApiResponse(responseCode = "400", description = "Ошибка валидации",
                    content = @Content(schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "404", description = "Заказ не найден",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<OrderResponse> updateOrder(
            @Parameter(description = "ID заказа") @PathVariable Long id,
            @Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.updateOrder(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Обновить статус заказа")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Статус обновлен",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
        @ApiResponse(responseCode = "404", description = "Заказ не найден",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @Parameter(description = "ID заказа") @PathVariable Long id,
            @Parameter(description = "Новый статус") @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить заказ")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Заказ удален"),
        @ApiResponse(responseCode = "404", description = "Заказ не найден",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}