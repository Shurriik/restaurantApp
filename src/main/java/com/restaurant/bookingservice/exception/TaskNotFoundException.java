package com.restaurant.bookingservice.exception;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(String taskId) {
        super("Задача с ID " + taskId + " не найдена");
    }
}