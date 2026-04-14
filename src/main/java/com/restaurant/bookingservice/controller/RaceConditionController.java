package com.restaurant.bookingservice.controller;

import com.restaurant.bookingservice.service.RaceConditionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/race")
@RequiredArgsConstructor
public class RaceConditionController {

    private final RaceConditionService raceConditionService;

    @PostMapping("/problem")
    public ResponseEntity<String> demonstrateProblem() throws InterruptedException {
        String result = raceConditionService.demonstrateProblem();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/solution")
    public ResponseEntity<String> demonstrateSolution() throws InterruptedException {
        String result = raceConditionService.demonstrateSolution();
        return ResponseEntity.ok(result);
    }
}