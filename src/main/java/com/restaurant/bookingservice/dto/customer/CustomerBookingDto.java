package com.restaurant.bookingservice.dto.customer;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerBookingDto {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer numberOfGuests;
    private String status;
    private Integer tableNumber;
}