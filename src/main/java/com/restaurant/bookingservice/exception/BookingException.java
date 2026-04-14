package com.restaurant.bookingservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class BookingException extends ResponseStatusException {
    public BookingException(HttpStatus status, String message) {
        super(status, message);
    }
}