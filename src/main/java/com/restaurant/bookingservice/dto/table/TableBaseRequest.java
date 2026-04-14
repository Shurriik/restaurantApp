package com.restaurant.bookingservice.dto.table;

import com.restaurant.bookingservice.enums.TableLocation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class TableBaseRequest {

    @NotNull(message = "Номер стола обязателен")
    @Min(value = 1, message = "Номер стола должен быть положительным")
    private Integer number;

    @NotNull(message = "Вместимость обязательна")
    @Min(value = 1, message = "Вместимость должна быть не менее 1")
    @Max(value = 20, message = "Вместимость не может превышать 20")
    private Integer capacity;

    @NotNull(message = "Расположение обязательно")
    private TableLocation location;

    @Builder.Default
    private boolean available = true;
}