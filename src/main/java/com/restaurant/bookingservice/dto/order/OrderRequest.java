package com.restaurant.bookingservice.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @NotNull(message = "ID бронирования обязателен")
    @Min(value = 1, message = "ID бронирования должен быть положительным")
    private Long bookingId;

    @NotEmpty(message = "Заказ должен содержать хотя бы одну позицию")
    @Valid
    private List<OrderItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {

        @NotNull(message = "ID блюда обязателен")
        @Min(value = 1, message = "ID блюда должен быть положительным")
        private Long menuItemId;

        @NotNull(message = "Количество обязательно")
        @Min(value = 1, message = "Количество должно быть не менее 1")
        @Max(value = 100, message = "Количество не может превышать 100")
        private Integer quantity;
    }
}