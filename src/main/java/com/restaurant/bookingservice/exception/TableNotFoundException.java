package com.restaurant.bookingservice.exception;

import org.springframework.http.HttpStatus;

public class TableNotFoundException extends BookingException {
    public TableNotFoundException(Long tableId) {
        super(HttpStatus.NOT_FOUND, "Стол с ID " + tableId + " не найден");
    }
}