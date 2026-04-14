package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.customer.CustomerRequest;
import com.restaurant.bookingservice.dto.customer.CustomerResponse;
import com.restaurant.bookingservice.mapper.CustomerMapper;
import com.restaurant.bookingservice.model.Customer;
import com.restaurant.bookingservice.repository.CustomerRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminCustomerService {

    private static final String CUSTOMER_NOT_FOUND_MESSAGE = "Клиент с ID %d не найден";
    private static final String CUSTOMER_PHONE_EXISTS_MESSAGE =
            "Клиент с телефоном %s уже существует";

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public List<CustomerResponse> getAllCustomers() {
        log.info("Получение всех клиентов");
        return customerMapper.toResponseList(customerRepository.findAll());
    }

    public CustomerResponse getCustomerById(Long id) {
        log.info("Получение клиента по ID: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(CUSTOMER_NOT_FOUND_MESSAGE, id)));
        return customerMapper.toResponse(customer);
    }

    public CustomerResponse getCustomerWithBookings(Long id) {
        log.info("Получение клиента с бронированиями по ID: {}", id);
        Customer customer = customerRepository.findByIdWithBookings(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(CUSTOMER_NOT_FOUND_MESSAGE, id)));
        return customerMapper.toResponse(customer);
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        log.info("Создание нового клиента: {}", request.getName());

        if (customerRepository.findByPhone(request.getPhone()).isPresent()) {
            log.warn("Попытка создать клиента с существующим телефоном: {}", request.getPhone());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format(CUSTOMER_PHONE_EXISTS_MESSAGE, request.getPhone()));
        }

        Customer customer = customerMapper.toEntity(request);
        Customer savedCustomer = customerRepository.save(customer);
        log.info("Клиент создан с ID: {}", savedCustomer.getId());

        return customerMapper.toResponse(savedCustomer);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        log.info("Обновление клиента с ID: {}", id);

        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(CUSTOMER_NOT_FOUND_MESSAGE, id)));

        if (!existingCustomer.getPhone().equals(request.getPhone())
                &&
                customerRepository.findByPhone(request.getPhone()).isPresent()) {
            log.warn("Попытка обновить клиента с существующим телефоном: {}", request.getPhone());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format(CUSTOMER_PHONE_EXISTS_MESSAGE, request.getPhone()));
        }

        existingCustomer.setName(request.getName());
        existingCustomer.setPhone(request.getPhone());
        existingCustomer.setEmail(request.getEmail());

        Customer updatedCustomer = customerRepository.save(existingCustomer);
        log.info("Клиент с ID {} обновлен", id);

        return customerMapper.toResponse(updatedCustomer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        log.info("Удаление клиента с ID: {}", id);

        if (!customerRepository.existsById(id)) {
            log.warn("Попытка удалить несуществующего клиента с ID: {}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    String.format(CUSTOMER_NOT_FOUND_MESSAGE, id));
        }
        customerRepository.deleteById(id);
        log.info("Клиент с ID {} удален", id);
    }

    public long getCustomersCount() {
        return customerRepository.count();
    }
}