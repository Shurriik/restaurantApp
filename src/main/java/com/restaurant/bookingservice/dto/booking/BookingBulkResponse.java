package com.restaurant.bookingservice.dto.booking;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingBulkResponse {
    private int totalRequested;
    private int successfullyCreated;
    private int failed;
    private List<BookingResponse> createdBookings;
    private List<String> errors;
}