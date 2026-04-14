package com.restaurant.bookingservice.exception;

import org.springframework.http.HttpStatus;

public class BookingNotFoundException extends BookingException {
    public BookingNotFoundException(Long id) {
        super(HttpStatus.NOT_FOUND, "Бронирование с ID " + id + " не найдено");
    }
}