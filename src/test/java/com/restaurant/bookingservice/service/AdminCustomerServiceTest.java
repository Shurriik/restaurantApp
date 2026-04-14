package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.customer.CustomerRequest;
import com.restaurant.bookingservice.dto.customer.CustomerResponse;
import com.restaurant.bookingservice.mapper.CustomerMapper;
import com.restaurant.bookingservice.model.Customer;
import com.restaurant.bookingservice.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminCustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerMapper customerMapper;

    @InjectMocks
    private AdminCustomerService adminCustomerService;

    private Customer customer;
    private CustomerRequest customerRequest;
    private CustomerResponse customerResponse;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setName("Иван Петров");
        customer.setPhone("+79991234567");
        customer.setEmail("ivan@example.com");

        customerRequest = new CustomerRequest();
        customerRequest.setName("Иван Петров");
        customerRequest.setPhone("+79991234567");
        customerRequest.setEmail("ivan@example.com");

        customerResponse = new CustomerResponse();
        customerResponse.setId(1L);
        customerResponse.setName("Иван Петров");
        customerResponse.setPhone("+79991234567");
        customerResponse.setEmail("ivan@example.com");
    }

    @Test
    void getAllCustomers_ShouldReturnListOfCustomers() {
        List<Customer> customers = List.of(customer);
        List<CustomerResponse> expectedResponses = List.of(customerResponse);

        when(customerRepository.findAll()).thenReturn(customers);
        when(customerMapper.toResponseList(customers)).thenReturn(expectedResponses);

        List<CustomerResponse> result = adminCustomerService.getAllCustomers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        verify(customerRepository).findAll();
        verify(customerMapper).toResponseList(customers);
    }

    @Test
    void getCustomerById_WithValidId_ShouldReturnCustomer() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerMapper.toResponse(customer)).thenReturn(customerResponse);

        CustomerResponse result = adminCustomerService.getCustomerById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Иван Петров");
        verify(customerRepository).findById(1L);
        verify(customerMapper).toResponse(customer);
    }

    @Test
    void getCustomerById_WithNonExistentId_ShouldThrowNotFoundException() {
        when(customerRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminCustomerService.getCustomerById(999L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(responseEx.getReason()).contains("Клиент с ID 999 не найден");
                });

        verify(customerRepository).findById(999L);
    }

    @Test
    void getCustomerWithBookings_WithValidId_ShouldReturnCustomer() {
        when(customerRepository.findByIdWithBookings(1L)).thenReturn(Optional.of(customer));
        when(customerMapper.toResponse(customer)).thenReturn(customerResponse);

        CustomerResponse result = adminCustomerService.getCustomerWithBookings(1L);

        assertThat(result.getId()).isEqualTo(1L);
        verify(customerRepository).findByIdWithBookings(1L);
        verify(customerMapper).toResponse(customer);
    }

    @Test
    void getCustomerWithBookings_WithNonExistentId_ShouldThrowNotFoundException() {
        when(customerRepository.findByIdWithBookings(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminCustomerService.getCustomerWithBookings(999L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });

        verify(customerRepository).findByIdWithBookings(999L);
    }

    @Test
    void createCustomer_WithValidRequest_ShouldCreateCustomer() {
        when(customerRepository.findByPhone(customerRequest.getPhone())).thenReturn(Optional.empty());
        when(customerMapper.toEntity(customerRequest)).thenReturn(customer);
        when(customerRepository.save(customer)).thenReturn(customer);
        when(customerMapper.toResponse(customer)).thenReturn(customerResponse);

        CustomerResponse result = adminCustomerService.createCustomer(customerRequest);

        assertThat(result.getId()).isEqualTo(1L);
        verify(customerRepository).findByPhone(customerRequest.getPhone());
        verify(customerMapper).toEntity(customerRequest);
        verify(customerRepository).save(customer);
        verify(customerMapper).toResponse(customer);
    }

    @Test
    void createCustomer_WithExistingPhone_ShouldThrowConflictException() {
        when(customerRepository.findByPhone(customerRequest.getPhone())).thenReturn(Optional.of(customer));

        assertThatThrownBy(() -> adminCustomerService.createCustomer(customerRequest))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(responseEx.getReason()).contains("Клиент с телефоном +79991234567 уже существует");
                });

        verify(customerRepository).findByPhone(customerRequest.getPhone());
        verify(customerRepository, never()).save(any());
    }

    @Test
    void updateCustomer_WithValidIdAndRequest_ShouldUpdateCustomer() {
        CustomerRequest updateRequest = new CustomerRequest();
        updateRequest.setName("Иван Сидоров");
        updateRequest.setPhone("+79991112233");
        updateRequest.setEmail("ivan.s@example.com");

        Customer existingCustomer = new Customer();
        existingCustomer.setId(1L);
        existingCustomer.setName("Иван Петров");
        existingCustomer.setPhone("+79991234567");
        existingCustomer.setEmail("ivan@example.com");

        Customer updatedCustomer = new Customer();
        updatedCustomer.setId(1L);
        updatedCustomer.setName("Иван Сидоров");
        updatedCustomer.setPhone("+79991112233");
        updatedCustomer.setEmail("ivan.s@example.com");

        CustomerResponse expectedResponse = new CustomerResponse();
        expectedResponse.setId(1L);
        expectedResponse.setName("Иван Сидоров");
        expectedResponse.setPhone("+79991112233");
        expectedResponse.setEmail("ivan.s@example.com");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(existingCustomer));
        when(customerRepository.findByPhone(updateRequest.getPhone())).thenReturn(Optional.empty());
        when(customerRepository.save(any(Customer.class))).thenReturn(updatedCustomer);
        when(customerMapper.toResponse(updatedCustomer)).thenReturn(expectedResponse);

        CustomerResponse result = adminCustomerService.updateCustomer(1L, updateRequest);

        assertThat(result.getName()).isEqualTo("Иван Сидоров");
        assertThat(result.getPhone()).isEqualTo("+79991112233");
        verify(customerRepository).findById(1L);
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void updateCustomer_WithNonExistentId_ShouldThrowNotFoundException() {
        CustomerRequest updateRequest = new CustomerRequest();
        updateRequest.setName("Иван Сидоров");
        updateRequest.setPhone("+79991112233");
        updateRequest.setEmail("ivan.s@example.com");

        when(customerRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminCustomerService.updateCustomer(999L, updateRequest))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });

        verify(customerRepository).findById(999L);
        verify(customerRepository, never()).save(any());
    }

    @Test
    void updateCustomer_WithExistingPhoneConflict_ShouldThrowConflictException() {
        CustomerRequest updateRequest = new CustomerRequest();
        updateRequest.setName("Иван Сидоров");
        updateRequest.setPhone("+79991112233");
        updateRequest.setEmail("ivan.s@example.com");

        Customer existingCustomer = new Customer();
        existingCustomer.setId(1L);
        existingCustomer.setPhone("+79991234567");

        Customer otherCustomer = new Customer();
        otherCustomer.setId(2L);
        otherCustomer.setPhone("+79991112233");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(existingCustomer));
        when(customerRepository.findByPhone(updateRequest.getPhone())).thenReturn(Optional.of(otherCustomer));

        assertThatThrownBy(() -> adminCustomerService.updateCustomer(1L, updateRequest))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(responseEx.getReason()).contains("Клиент с телефоном +79991112233 уже существует");
                });

        verify(customerRepository).findById(1L);
        verify(customerRepository).findByPhone(updateRequest.getPhone());
        verify(customerRepository, never()).save(any());
    }

    @Test
    void deleteCustomer_WithValidId_ShouldDeleteCustomer() {
        when(customerRepository.existsById(1L)).thenReturn(true);
        doNothing().when(customerRepository).deleteById(1L);

        adminCustomerService.deleteCustomer(1L);

        verify(customerRepository).existsById(1L);
        verify(customerRepository).deleteById(1L);
    }

    @Test
    void deleteCustomer_WithNonExistentId_ShouldThrowNotFoundException() {
        when(customerRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> adminCustomerService.deleteCustomer(999L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });

        verify(customerRepository).existsById(999L);
        verify(customerRepository, never()).deleteById(any());
    }

    @Test
    void getCustomersCount_ShouldReturnCount() {
        when(customerRepository.count()).thenReturn(5L);

        long count = adminCustomerService.getCustomersCount();

        assertThat(count).isEqualTo(5L);
        verify(customerRepository).count();
    }

    @Test
    @DisplayName("updateCustomer - телефон не меняется (пропуск проверки конфликта)")
    void shouldUpdateCustomerWhenPhoneNotChanged() {
        CustomerRequest updateRequest = new CustomerRequest();
        updateRequest.setName("Иван Сидоров");
        updateRequest.setPhone("+79991234567");
        updateRequest.setEmail("ivan.s@email.com");

        Customer existingCustomer = new Customer();
        existingCustomer.setId(1L);
        existingCustomer.setName("Иван Петров");
        existingCustomer.setPhone("+79991234567");
        existingCustomer.setEmail("ivan@example.com");

        Customer updatedCustomer = new Customer();
        updatedCustomer.setId(1L);
        updatedCustomer.setName("Иван Сидоров");
        updatedCustomer.setPhone("+79991234567");
        updatedCustomer.setEmail("ivan.s@email.com");

        CustomerResponse expectedResponse = new CustomerResponse();
        expectedResponse.setId(1L);
        expectedResponse.setName("Иван Сидоров");
        expectedResponse.setPhone("+79991234567");
        expectedResponse.setEmail("ivan.s@email.com");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(existingCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(updatedCustomer);
        when(customerMapper.toResponse(updatedCustomer)).thenReturn(expectedResponse);

        CustomerResponse result = adminCustomerService.updateCustomer(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Иван Сидоров");
        assertThat(result.getPhone()).isEqualTo("+79991234567");
        verify(customerRepository).findById(1L);
        verify(customerRepository, never()).findByPhone(anyString());
        verify(customerRepository).save(any(Customer.class));
    }
}