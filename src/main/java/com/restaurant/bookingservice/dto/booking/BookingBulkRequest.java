package com.restaurant.bookingservice.dto.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingBulkRequest {

    @NotEmpty(message = "Список бронирований не может быть пустым")
    @Valid
    private List<CompleteBookingRequest> bookings;
}