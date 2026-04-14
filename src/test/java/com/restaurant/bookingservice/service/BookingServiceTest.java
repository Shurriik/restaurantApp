package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.booking.BookingBulkResponse;
import com.restaurant.bookingservice.dto.booking.BookingResponse;
import com.restaurant.bookingservice.dto.booking.CompleteBookingRequest;
import com.restaurant.bookingservice.enums.BookingStatus;
import com.restaurant.bookingservice.mapper.BookingMapper;
import com.restaurant.bookingservice.model.Booking;
import com.restaurant.bookingservice.model.Customer;
import com.restaurant.bookingservice.model.RestaurantTable;
import com.restaurant.bookingservice.repository.BookingRepository;
import com.restaurant.bookingservice.repository.CustomerRepository;
import com.restaurant.bookingservice.repository.TableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService Unit Tests")
class BookingServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private TableRepository tableRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private BookingService bookingService;

    private CompleteBookingRequest validRequest;
    private RestaurantTable validTable;
    private Customer validCustomer;
    private Booking validBooking;
    private BookingResponse validResponse;

    @BeforeEach
    void setUp() {
        validRequest = CompleteBookingRequest.builder()
                .customerName("Test Customer")
                .customerPhone("+375331234567")
                .customerEmail("test@email.com")
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .numberOfGuests(4)
                .tableId(1L)
                .build();

        validTable = RestaurantTable.builder()
                .id(1L)
                .number(1)
                .capacity(4)
                .available(true)
                .build();

        validCustomer = Customer.builder()
                .id(1L)
                .name("Test Customer")
                .phone("+375331234567")
                .email("test@email.com")
                .build();

        validBooking = Booking.builder()
                .id(1L)
                .startTime(validRequest.getStartTime())
                .endTime(validRequest.getEndTime())
                .numberOfGuests(4)
                .status(BookingStatus.CONFIRMED)
                .customer(validCustomer)
                .table(validTable)
                .build();

        validResponse = BookingResponse.builder()
                .id(1L)
                .customerId(1L)
                .customerName("Test Customer")
                .customerPhone("+375331234567")
                .tableId(1L)
                .tableNumber(1)
                .startTime(validRequest.getStartTime())
                .endTime(validRequest.getEndTime())
                .numberOfGuests(4)
                .status(BookingStatus.CONFIRMED)
                .build();
    }

    @Test
    @DisplayName("getBookingById - найдено")
    void shouldReturnBookingWhenExists() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(validBooking));

        Booking result = bookingService.getBookingById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getBookingById - не найдено")
    void shouldThrowExceptionWhenBookingNotFound() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBookingById(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Бронирование с ID 1 не найдено");
    }

    @Test
    @DisplayName("getAllBookings")
    void shouldReturnAllBookings() {
        when(bookingRepository.findAll()).thenReturn(List.of(validBooking));

        List<Booking> result = bookingService.getAllBookings();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("createBooking - успешно")
    void shouldCreateBookingSuccessfully() {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(validTable));
        when(bookingRepository.findByTableIdAndStartTimeBetween(any(), any(), any())).thenReturn(List.of());
        when(customerRepository.save(any(Customer.class))).thenReturn(validCustomer);
        when(bookingRepository.save(any(Booking.class))).thenReturn(validBooking);

        Booking result = bookingService.createBooking(validRequest);

        assertThat(result).isNotNull();
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBooking - стол не найден")
    void shouldThrowExceptionWhenTableNotFound() {
        when(tableRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.createBooking(validRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Стол с ID 1 не найден");
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBooking - стол занят")
    void shouldThrowExceptionWhenTableNotAvailable() {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(validTable));
        when(bookingRepository.findByTableIdAndStartTimeBetween(any(), any(), any()))
                .thenReturn(List.of(validBooking));

        assertThatThrownBy(() -> bookingService.createBooking(validRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Стол 1 занят на указанное время");
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("updateBooking - успешно с изменением стола")
    void shouldUpdateBookingWithTableChangeSuccessfully() {
        CompleteBookingRequest updateRequest = CompleteBookingRequest.builder()
                .customerName("Updated Customer")
                .customerPhone("+375331234567")
                .customerEmail("updated@email.com")
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(2).plusHours(2))
                .numberOfGuests(6)
                .tableId(2L)
                .build();

        RestaurantTable newTable = RestaurantTable.builder()
                .id(2L)
                .number(2)
                .capacity(6)
                .available(true)
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(validBooking));
        when(tableRepository.findById(2L)).thenReturn(Optional.of(newTable));
        when(bookingRepository.findByTableIdAndStartTimeBetween(any(), any(), any())).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenReturn(validBooking);

        Booking result = bookingService.updateBooking(1L, updateRequest);

        assertThat(result).isNotNull();
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("updateBooking - успешно без изменения стола")
    void shouldUpdateBookingWithoutTableChangeSuccessfully() {
        CompleteBookingRequest updateRequest = CompleteBookingRequest.builder()
                .customerName("Updated Customer")
                .customerPhone("+375331234567")
                .customerEmail("updated@email.com")
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(2).plusHours(2))
                .numberOfGuests(6)
                .tableId(1L)
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(validBooking));
        when(tableRepository.findById(1L)).thenReturn(Optional.of(validTable));
        when(bookingRepository.save(any(Booking.class))).thenReturn(validBooking);

        Booking result = bookingService.updateBooking(1L, updateRequest);

        assertThat(result).isNotNull();
        verify(bookingRepository, never()).findByTableIdAndStartTimeBetween(any(), any(), any());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("updateBooking - бронирование не найдено")
    void shouldThrowExceptionWhenBookingNotFoundForUpdate() {
        CompleteBookingRequest updateRequest = CompleteBookingRequest.builder()
                .tableId(1L)
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.updateBooking(1L, updateRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Бронирование с ID 1 не найдено");
    }

    @Test
    @DisplayName("deleteBooking - успешно")
    void shouldDeleteBookingSuccessfully() {
        when(bookingRepository.existsById(1L)).thenReturn(true);
        doNothing().when(bookingRepository).deleteById(1L);

        bookingService.deleteBooking(1L);

        verify(bookingRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("deleteBooking - не найдено")
    void shouldThrowExceptionWhenBookingNotFoundForDelete() {
        when(bookingRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> bookingService.deleteBooking(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Бронирование с ID 1 не найдено");
        verify(bookingRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("createBookingWithoutTransaction - успешно")
    void shouldCreateBookingWithoutTransactionSuccessfully() {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(validTable));
        when(bookingRepository.findByTableIdAndStartTimeBetween(any(), any(), any())).thenReturn(List.of());
        when(customerRepository.save(any(Customer.class))).thenReturn(validCustomer);
        when(bookingRepository.save(any(Booking.class))).thenReturn(validBooking);

        bookingService.createBookingWithoutTransaction(validRequest);

        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBookingWithoutTransaction - с ошибкой (tableId=999)")
    void shouldThrowExceptionWhenTableIdIs999() {
        CompleteBookingRequest errorRequest = CompleteBookingRequest.builder()
                .customerName("Error Customer")
                .customerPhone("+375339991111")
                .customerEmail("error@email.com")
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .numberOfGuests(4)
                .tableId(999L)
                .build();

        when(customerRepository.save(any(Customer.class))).thenReturn(validCustomer);

        assertThatThrownBy(() -> bookingService.createBookingWithoutTransaction(errorRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Демонстрационная ошибка: стол с ID=999 запрещен");

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBookingWithTransaction - успешно")
    void shouldCreateBookingWithTransactionSuccessfully() {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(validTable));
        when(bookingRepository.findByTableIdAndStartTimeBetween(any(), any(), any())).thenReturn(List.of());
        when(customerRepository.save(any(Customer.class))).thenReturn(validCustomer);
        when(bookingRepository.save(any(Booking.class))).thenReturn(validBooking);

        bookingService.createBookingWithTransaction(validRequest);

        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBookingWithTransaction - с ошибкой (tableId=999)")
    void shouldThrowExceptionWhenTableIdIs999ForTransaction() {
        CompleteBookingRequest errorRequest = CompleteBookingRequest.builder()
                .customerName("Error Customer")
                .customerPhone("+375339991111")
                .customerEmail("error@email.com")
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .numberOfGuests(4)
                .tableId(999L)
                .build();

        when(customerRepository.save(any(Customer.class))).thenReturn(validCustomer);

        assertThatThrownBy(() -> bookingService.createBookingWithTransaction(errorRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Демонстрационная ошибка: стол с ID=999 запрещен");

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBookingsWithoutTransaction - все успешно")
    void shouldCreateAllBookingsInBulkWithoutTransaction() {
        List<CompleteBookingRequest> requests = List.of(validRequest, validRequest);
        when(tableRepository.findById(1L)).thenReturn(Optional.of(validTable));
        when(bookingRepository.findByTableIdAndStartTimeBetween(any(), any(), any())).thenReturn(List.of());
        when(customerRepository.save(any(Customer.class))).thenReturn(validCustomer);
        when(bookingRepository.save(any(Booking.class))).thenReturn(validBooking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(validResponse);

        BookingBulkResponse response = bookingService.createBookingsWithoutTransaction(requests);

        assertThat(response.getTotalRequested()).isEqualTo(2);
        assertThat(response.getSuccessfullyCreated()).isEqualTo(2);
        assertThat(response.getFailed()).isZero();
        verify(bookingRepository, times(2)).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBookingsWithoutTransaction - с ошибкой (стол не найден)")
    void shouldHandleTableNotFoundErrorInBulkCreateWithoutTransaction() {
        CompleteBookingRequest validRequest2 = CompleteBookingRequest.builder()
                .customerName("Valid Customer")
                .customerPhone("+375331234568")
                .customerEmail("valid@email.com")
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .numberOfGuests(4)
                .tableId(1L)
                .build();

        CompleteBookingRequest errorRequest = CompleteBookingRequest.builder()
                .customerName("Error Customer")
                .customerPhone("+375339991111")
                .customerEmail("error@email.com")
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .numberOfGuests(4)
                .tableId(999L)
                .build();

        List<CompleteBookingRequest> requests = List.of(validRequest2, errorRequest);

        when(tableRepository.findById(1L)).thenReturn(Optional.of(validTable));
        when(bookingRepository.findByTableIdAndStartTimeBetween(any(), any(), any())).thenReturn(List.of());
        when(customerRepository.save(any(Customer.class))).thenReturn(validCustomer);
        when(bookingRepository.save(any(Booking.class))).thenReturn(validBooking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(validResponse);

        BookingBulkResponse response = bookingService.createBookingsWithoutTransaction(requests);

        assertThat(response.getTotalRequested()).isEqualTo(2);
        assertThat(response.getSuccessfullyCreated()).isEqualTo(1);
        assertThat(response.getFailed()).isEqualTo(1);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBookingsWithoutTransaction - с ошибкой (стол занят)")
    void shouldHandleTableNotAvailableErrorInBulkCreateWithoutTransaction() {
        CompleteBookingRequest errorRequest = CompleteBookingRequest.builder()
                .customerName("Error Customer")
                .customerPhone("+375339991111")
                .customerEmail("error@email.com")
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .numberOfGuests(4)
                .tableId(1L)
                .build();

        List<CompleteBookingRequest> requests = List.of(errorRequest);

        when(tableRepository.findById(1L)).thenReturn(Optional.of(validTable));
        when(bookingRepository.findByTableIdAndStartTimeBetween(any(), any(), any()))
                .thenReturn(List.of(validBooking));

        BookingBulkResponse response = bookingService.createBookingsWithoutTransaction(requests);

        assertThat(response.getTotalRequested()).isEqualTo(1);
        assertThat(response.getSuccessfullyCreated()).isZero();
        assertThat(response.getFailed()).isEqualTo(1);
        assertThat(response.getErrors()).hasSize(1);
        assertThat(response.getErrors().get(0)).contains("Стол 1 занят на указанное время");
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBookingsWithTransaction - успешно")
    void shouldCreateAllBookingsWithTransactionSuccessfully() {
        List<CompleteBookingRequest> requests = List.of(validRequest, validRequest);
        when(tableRepository.findById(1L)).thenReturn(Optional.of(validTable));
        when(bookingRepository.findByTableIdAndStartTimeBetween(any(), any(), any())).thenReturn(List.of());
        when(customerRepository.save(any(Customer.class))).thenReturn(validCustomer);
        when(bookingRepository.save(any(Booking.class))).thenReturn(validBooking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(validResponse);

        BookingBulkResponse response = bookingService.createBookingsWithTransaction(requests);

        assertThat(response.getTotalRequested()).isEqualTo(2);
        assertThat(response.getSuccessfullyCreated()).isEqualTo(2);
        assertThat(response.getFailed()).isZero();
        verify(bookingRepository, times(2)).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBookingsWithTransaction - с ошибкой (tableId=999)")
    void shouldThrowExceptionWhenErrorInBulkCreateWithTransaction() {
        CompleteBookingRequest errorRequest = CompleteBookingRequest.builder()
                .customerName("Error Customer")
                .customerPhone("+375339991111")
                .customerEmail("error@email.com")
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .numberOfGuests(4)
                .tableId(999L)
                .build();

        List<CompleteBookingRequest> requests = List.of(errorRequest);

        when(customerRepository.save(any(Customer.class))).thenReturn(validCustomer);

        assertThatThrownBy(() -> bookingService.createBookingsWithTransaction(requests))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Демонстрационная ошибка: стол с ID=999 запрещен");

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBookingsWithStream")
    void shouldCreateAllBookingsUsingStream() {
        List<CompleteBookingRequest> requests = List.of(validRequest, validRequest);
        when(tableRepository.findById(1L)).thenReturn(Optional.of(validTable));
        when(bookingRepository.findByTableIdAndStartTimeBetween(any(), any(), any())).thenReturn(List.of());
        when(customerRepository.save(any(Customer.class))).thenReturn(validCustomer);
        when(bookingRepository.save(any(Booking.class))).thenReturn(validBooking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(validResponse);

        BookingBulkResponse response = bookingService.createBookingsWithStream(requests);

        assertThat(response.getTotalRequested()).isEqualTo(2);
        assertThat(response.getSuccessfullyCreated()).isEqualTo(2);
        verify(bookingRepository, times(2)).save(any(Booking.class));
    }

    @Test
    @DisplayName("getBookingsByIds - все найдены")
    void shouldReturnOnlyExistingBookingsByIds() {
        List<Long> ids = List.of(1L, 2L, 3L);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(validBooking));
        when(bookingRepository.findById(2L)).thenReturn(Optional.empty());
        when(bookingRepository.findById(3L)).thenReturn(Optional.of(validBooking));
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(validResponse);

        List<BookingResponse> result = bookingService.getBookingsByIds(ids);

        assertThat(result).hasSize(2);
        verify(bookingRepository, times(3)).findById(anyLong());
    }

    @Test
    @DisplayName("findAllWithEntityGraph")
    void shouldReturnAllBookingsWithEntityGraph() {
        when(bookingRepository.findAllWithDetails()).thenReturn(List.of(validBooking));
        when(bookingMapper.toResponse(validBooking)).thenReturn(validResponse);

        List<BookingResponse> result = bookingService.findAllWithEntityGraph();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("findBookingsByComplexCriteria - из кэша")
    void shouldReturnBookingsFromCache() {
        LocalDateTime startDate = LocalDateTime.now();

        when(bookingRepository.findBookingsByComplexCriteriaJpql(any(), any(), any(), any()))
                .thenReturn(List.of(validBooking));
        when(bookingMapper.toResponse(validBooking)).thenReturn(validResponse);

        bookingService.findBookingsByComplexCriteria("Test", 4, BookingStatus.CONFIRMED, startDate);

        List<BookingResponse> result = bookingService.findBookingsByComplexCriteria(
                "Test", 4, BookingStatus.CONFIRMED, startDate);

        assertThat(result).hasSize(1);
        verify(bookingRepository, times(1)).findBookingsByComplexCriteriaJpql(any(), any(), any(), any());
    }

    @Test
    @DisplayName("findBookingsByComplexCriteriaNative")
    void shouldReturnBookingsFromNativeQuery() {
        LocalDateTime startDate = LocalDateTime.now();
        when(bookingRepository.findBookingsByComplexCriteriaNative(any(), any(), any(), any()))
                .thenReturn(List.of(validBooking));
        when(bookingMapper.toResponse(validBooking)).thenReturn(validResponse);

        List<BookingResponse> result = bookingService.findBookingsByComplexCriteriaNative(
                "Test", 4, BookingStatus.CONFIRMED, startDate);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("findBookingsWithPagination")
    void shouldReturnPaginatedBookings() {
        Page<Booking> bookingPage = new PageImpl<>(List.of(validBooking), PageRequest.of(0, 10), 1);

        when(bookingRepository.findBookingsWithPagination(any(), any(), any(), any(PageRequest.class)))
                .thenReturn(bookingPage);
        when(bookingMapper.toResponse(validBooking)).thenReturn(validResponse);

        Page<BookingResponse> result = bookingService.findBookingsWithPagination(
                "Test", 4, BookingStatus.CONFIRMED, 0, 10, "id", "asc");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("findBookingsWithPagination - с сортировкой по убыванию")
    void shouldReturnPaginatedBookingsWithDescSort() {
        Page<Booking> bookingPage = new PageImpl<>(List.of(validBooking), PageRequest.of(0, 10, Sort.by("id").descending()), 1);

        when(bookingRepository.findBookingsWithPagination(any(), any(), any(), any(PageRequest.class)))
                .thenReturn(bookingPage);
        when(bookingMapper.toResponse(validBooking)).thenReturn(validResponse);

        Page<BookingResponse> result = bookingService.findBookingsWithPagination(
                "Test", 4, BookingStatus.CONFIRMED, 0, 10, "id", "desc");

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("getCacheSize")
    void shouldReturnCacheSize() {
        int size = bookingService.getCacheSize();
        assertThat(size).isZero();
    }

    @Test
    @DisplayName("clearCache")
    void shouldClearCache() {
        bookingService.clearCache();
        assertThat(bookingService.getCacheSize()).isZero();
    }

    @Test
    @DisplayName("demonstrateNPlus1Problem")
    void shouldDemonstrateNPlus1Problem() {
        when(bookingRepository.findAll()).thenReturn(List.of(validBooking));

        bookingService.demonstrateNplus1Problem();

        verify(bookingRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("demonstrateNPlus1Solution")
    void shouldDemonstrateNPlus1Solution() {
        when(bookingRepository.findAllWithDetails()).thenReturn(List.of(validBooking));

        bookingService.demonstrateNplus1Solution();

        verify(bookingRepository, times(1)).findAllWithDetails();
    }
}