package com.restaurant.bookingservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.bind.annotation.GetMapping;

@SpringBootApplication
@EnableAsync
public class BookingserviceApplication {
    public static void main(String[] args) {
        SpringApplication.run(BookingserviceApplication.class, args);
    }
    @GetMapping("/")
    public String home() {
        return "Restaurant Booking Service is running!";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
