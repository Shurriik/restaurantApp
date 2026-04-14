package com.restaurant.bookingservice.mapper;

import com.restaurant.bookingservice.dto.customer.CustomerBookingDto;
import com.restaurant.bookingservice.dto.customer.CustomerRequest;
import com.restaurant.bookingservice.dto.customer.CustomerResponse;
import com.restaurant.bookingservice.model.Booking;
import com.restaurant.bookingservice.model.Customer;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public CustomerResponse toResponse(Customer customer) {
        if (customer == null) {
            return null;
        }

        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .bookings(customer.getBookings() != null
                        ? customer.getBookings().stream()
                                .map(this::toBookingDto)
                                .toList() :
                        null)
                .build();
    }

    private CustomerBookingDto toBookingDto(Booking booking) {
        return CustomerBookingDto.builder()
                .id(booking.getId())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .numberOfGuests(booking.getNumberOfGuests())
                .status(booking.getStatus() != null ? booking.getStatus().toString() : null)
                .tableNumber(booking.getTable() != null ? booking.getTable().getNumber() : null)
                .build();
    }

    public Customer toEntity(CustomerRequest request) {
        if (request == null) {
            return null;
        }

        return Customer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .build();
    }

    public List<CustomerResponse> toResponseList(List<Customer> customers) {
        if (customers == null) {
            return List.of();
        }
        return customers.stream().map(this::toResponse).toList();
    }
}