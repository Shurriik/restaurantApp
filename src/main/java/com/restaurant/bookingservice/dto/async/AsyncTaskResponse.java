package com.restaurant.bookingservice.dto.async;

import com.restaurant.bookingservice.dto.menu.MenuItemResponse;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsyncTaskResponse {
    private String taskId;
    private String status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private MenuItemResponse result;
    private String error;
}