package com.restaurant.bookingservice.dto.booking;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteBookingRequest {

    @NotBlank(message = "Имя клиента обязательно")
    @Size(min = 2, max = 100, message = "Имя должно содержать от 2 до 100 символов")
    private String customerName;

    @NotBlank(message = "Телефон обязателен")
    @Pattern(regexp = "^\\+375\\d{9}$", message = "Телефон должен быть в формате +375XXXXXXXXX")
    private String customerPhone;

    @Email(message = "Некорректный формат email")
    @NotBlank(message = "Email обязателен")
    private String customerEmail;

    @NotNull(message = "Время начала обязательно")
    @Future(message = "Время начала должно быть в будущем")
    private LocalDateTime startTime;

    @NotNull(message = "Время окончания обязательно")
    @Future(message = "Время окончания должно быть в будущем")
    private LocalDateTime endTime;

    @Min(value = 1, message = "Количество гостей должно быть не менее 1")
    @Max(value = 20, message = "Количество гостей не может превышать 20")
    private Integer numberOfGuests;

    @NotNull(message = "ID стола обязателен")
    @Min(value = 1, message = "ID стола должен быть положительным")
    private Long tableId;

}