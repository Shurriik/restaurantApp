package com.restaurant.bookingservice.cache;

import com.restaurant.bookingservice.enums.BookingStatus;
import java.time.LocalDateTime;

public record BookingQueryKey(
        String customerName,
        Integer minCapacity,
        BookingStatus status,
        LocalDateTime startDate
) {
}