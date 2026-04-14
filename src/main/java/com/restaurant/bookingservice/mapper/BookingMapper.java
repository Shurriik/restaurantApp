package com.restaurant.bookingservice.mapper;

import com.restaurant.bookingservice.dto.admin.BookingAdminResponse;
import com.restaurant.bookingservice.dto.booking.BookingResponse;
import com.restaurant.bookingservice.model.Booking;
import com.restaurant.bookingservice.model.Customer;
import com.restaurant.bookingservice.model.RestaurantTable;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }

        Customer customer = booking.getCustomer();
        RestaurantTable table = booking.getTable();

        return BookingResponse.builder()
                .id(booking.getId())
                .customerId(customer != null ? customer.getId() : null)
                .customerName(customer != null ? customer.getName() : null)
                .customerPhone(customer != null ? customer.getPhone() : null)
                .tableId(table != null ? table.getId() : null)
                .tableNumber(table != null ? table.getNumber() : null)
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .numberOfGuests(booking.getNumberOfGuests())
                .status(booking.getStatus())
                .build();
    }

    public BookingAdminResponse toAdminResponse(Booking booking) {
        if (booking == null) {
            return null;
        }

        Customer customer = booking.getCustomer();
        RestaurantTable table = booking.getTable();

        return BookingAdminResponse.builder()
                .id(booking.getId())
                .customerId(customer != null ? customer.getId() : null)
                .customerName(customer != null ? customer.getName() : null)
                .customerPhone(customer != null ? customer.getPhone() : null)
                .customerEmail(customer != null ? customer.getEmail() : null)
                .tableId(table != null ? table.getId() : null)
                .tableNumber(table != null ? table.getNumber() : null)
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .numberOfGuests(booking.getNumberOfGuests())
                .status(booking.getStatus())
                .build();
    }

    public List<BookingAdminResponse> toAdminResponseList(List<Booking> bookings) {
        if (bookings == null) {
            return List.of();
        }
        return bookings.stream().map(this::toAdminResponse).toList();
    }
}