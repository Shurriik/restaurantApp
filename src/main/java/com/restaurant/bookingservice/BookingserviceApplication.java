package com.restaurant.bookingservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BookingserviceApplication {
    public static void main(String[] args) {
        SpringApplication.run(BookingserviceApplication.class, args);
    }
}
