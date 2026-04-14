package com.restaurant.bookingservice.mapper;

import com.restaurant.bookingservice.dto.order.OrderResponse;
import com.restaurant.bookingservice.model.Order;
import com.restaurant.bookingservice.model.OrderItem;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        if (order == null) {
            return null;
        }

        return OrderResponse.builder()
                .id(order.getId())
                .bookingId(order.getBooking() != null ? order.getBooking().getId() : null)
                .orderTime(order.getOrderTime())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .items(order.getOrderItems().stream()
                        .map(this::toOrderItemResponse)
                        .toList())
                .build();
    }

    private OrderResponse.OrderItemResponse toOrderItemResponse(OrderItem orderItem) {
        return OrderResponse.OrderItemResponse.builder()
                .id(orderItem.getId())
                .menuItemName(orderItem.getMenuItem() != null
                        ? orderItem.getMenuItem().getName() : null)
                .menuItemPrice(orderItem.getMenuItem() != null
                        ? orderItem.getMenuItem().getPrice() : null)
                .quantity(orderItem.getQuantity())
                .totalPrice(orderItem.getTotalPrice())
                .build();
    }
}