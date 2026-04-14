package com.restaurant.bookingservice.dto.booking;

import com.restaurant.bookingservice.enums.BookingStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long tableId;
    private Integer tableNumber;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer numberOfGuests;
    private BookingStatus status;
}