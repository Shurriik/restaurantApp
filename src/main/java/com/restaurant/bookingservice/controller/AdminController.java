package com.restaurant.bookingservice.controller;

import com.restaurant.bookingservice.dto.admin.BookingAdminResponse;
import com.restaurant.bookingservice.dto.admin.TableAdminRequest;
import com.restaurant.bookingservice.dto.admin.TableAdminResponse;
import com.restaurant.bookingservice.dto.customer.CustomerRequest;
import com.restaurant.bookingservice.dto.customer.CustomerResponse;
import com.restaurant.bookingservice.enums.BookingStatus;
import com.restaurant.bookingservice.service.AdminBookingService;
import com.restaurant.bookingservice.service.AdminCustomerService;
import com.restaurant.bookingservice.service.AdminTableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Администрирование", description = "Административные операции")
public class AdminController {
    private final AdminTableService tableService;
    private final AdminBookingService adminBookingService;
    private final AdminCustomerService customerService;

    @GetMapping("/tables")
    @Operation(summary = "Получить все столики")
    public ResponseEntity<List<TableAdminResponse>> getAllTables() {
        return ResponseEntity.ok(tableService.getAllTables());
    }

    @GetMapping("/tables/{id}")
    @Operation(summary = "Получить столик по ID")
    public ResponseEntity<TableAdminResponse> getTableById(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.getTableById(id));
    }

    @PostMapping("/tables")
    @Operation(summary = "Создать новый столик")
    public ResponseEntity<TableAdminResponse> createTable(@Valid @RequestBody
                                                              TableAdminRequest request) {
        TableAdminResponse response = tableService.createTable(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/tables/{id}")
    @Operation(summary = "Обновить столик")
    public ResponseEntity<TableAdminResponse> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody TableAdminRequest request) {
        return ResponseEntity.ok(tableService.updateTable(id, request));
    }

    @DeleteMapping("/tables/{id}")
    @Operation(summary = "Удалить столик")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tables/count")
    @Operation(summary = "Получить количество столиков")
    public ResponseEntity<Long> getTablesCount() {
        return ResponseEntity.ok(tableService.getTablesCount());
    }

    @GetMapping("/bookings")
    @Operation(summary = "Получить все бронирования (админ)")
    public ResponseEntity<List<BookingAdminResponse>> getAllBookings() {
        return ResponseEntity.ok(adminBookingService.getAllBookings());
    }

    @GetMapping("/bookings/{id}")
    @Operation(summary = "Получить бронирование по ID (админ)")
    public ResponseEntity<BookingAdminResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(adminBookingService.getBookingById(id));
    }

    @GetMapping("/bookings/status/{status}")
    @Operation(summary = "Получить бронирования по статусу")
    public ResponseEntity<List<BookingAdminResponse>> getBookingsByStatus(
            @PathVariable BookingStatus status) {
        return ResponseEntity.ok(adminBookingService.getBookingsByStatus(status));
    }

    @PostMapping("/bookings/{id}/cancel")
    @Operation(summary = "Отменить бронирование")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        adminBookingService.cancelBooking(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/bookings/{id}")
    @Operation(summary = "Удалить бронирование (админ)")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        adminBookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bookings/count")
    @Operation(summary = "Получить количество бронирований")
    public ResponseEntity<Long> getBookingsCount() {
        return ResponseEntity.ok(adminBookingService.getBookingsCount());
    }

    @GetMapping("/customers")
    @Operation(summary = "Получить всех клиентов")
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/customers/{id}")
    @Operation(summary = "Получить клиента по ID")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @GetMapping("/customers/{id}/with-bookings")
    @Operation(summary = "Получить клиента с бронированиями")
    public ResponseEntity<CustomerResponse> getCustomerWithBookings(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerWithBookings(id));
    }

    @PostMapping("/customers")
    @Operation(summary = "Создать нового клиента")
    public ResponseEntity<CustomerResponse> createCustomer(
            @Valid @RequestBody CustomerRequest request) {
        CustomerResponse savedCustomer = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCustomer);
    }

    @PutMapping("/customers/{id}")
    @Operation(summary = "Обновить клиента")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        CustomerResponse updatedCustomer = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(updatedCustomer);
    }

    @DeleteMapping("/customers/{id}")
    @Operation(summary = "Удалить клиента")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customers/count")
    @Operation(summary = "Получить количество клиентов")
    public ResponseEntity<Long> getCustomersCount() {
        return ResponseEntity.ok(customerService.getCustomersCount());
    }
}