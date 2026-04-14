package com.restaurant.bookingservice.exception;

import org.springframework.http.HttpStatus;

public class TableNotAvailableException extends BookingException {
    public TableNotAvailableException(Integer tableNumber) {
        super(HttpStatus.CONFLICT, "Стол " + tableNumber + " занят на указанное время");
    }
}