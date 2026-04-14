package com.restaurant.bookingservice.dto.admin;

import com.restaurant.bookingservice.enums.TableLocation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableAdminResponse {
    private Long id;
    private Integer number;
    private Integer capacity;
    private TableLocation location;
    private boolean available;
}