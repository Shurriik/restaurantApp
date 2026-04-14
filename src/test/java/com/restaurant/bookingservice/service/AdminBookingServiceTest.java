package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.admin.BookingAdminResponse;
import com.restaurant.bookingservice.enums.BookingStatus;
import com.restaurant.bookingservice.mapper.BookingMapper;
import com.restaurant.bookingservice.model.Booking;
import com.restaurant.bookingservice.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminBookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private AdminBookingService adminBookingService;

    private Booking booking;
    private BookingAdminResponse bookingAdminResponse;

    @BeforeEach
    void setUp() {
        booking = new Booking();
        booking.setId(1L);
        booking.setStatus(BookingStatus.CONFIRMED);

        bookingAdminResponse = new BookingAdminResponse();
        bookingAdminResponse.setId(1L);
        bookingAdminResponse.setStatus(BookingStatus.CONFIRMED);
    }

    @Test
    void getAllBookings_ShouldReturnListOfBookings() {
        List<Booking> bookings = List.of(booking);
        List<BookingAdminResponse> expectedResponses = List.of(bookingAdminResponse);

        when(bookingRepository.findAll()).thenReturn(bookings);
        when(bookingMapper.toAdminResponseList(bookings)).thenReturn(expectedResponses);

        List<BookingAdminResponse> result = adminBookingService.getAllBookings();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        verify(bookingRepository).findAll();
        verify(bookingMapper).toAdminResponseList(bookings);
    }

    @Test
    void getBookingsByStatus_ShouldReturnFilteredBookings() {
        List<Booking> bookings = List.of(booking);
        List<BookingAdminResponse> expectedResponses = List.of(bookingAdminResponse);

        when(bookingRepository.findByStatus(BookingStatus.CONFIRMED)).thenReturn(bookings);
        when(bookingMapper.toAdminResponseList(bookings)).thenReturn(expectedResponses);

        List<BookingAdminResponse> result = adminBookingService.getBookingsByStatus(BookingStatus.CONFIRMED);

        assertThat(result).hasSize(1);
        verify(bookingRepository).findByStatus(BookingStatus.CONFIRMED);
        verify(bookingMapper).toAdminResponseList(bookings);
    }

    @Test
    void getBookingById_WithValidId_ShouldReturnBooking() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingMapper.toAdminResponse(booking)).thenReturn(bookingAdminResponse);

        BookingAdminResponse result = adminBookingService.getBookingById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        verify(bookingRepository).findById(1L);
        verify(bookingMapper).toAdminResponse(booking);
    }

    @Test
    void getBookingById_WithNonExistentId_ShouldThrowNotFoundException() {
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminBookingService.getBookingById(999L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(responseEx.getReason()).contains("Бронирование с ID 999 не найдено");
                });

        verify(bookingRepository).findById(999L);
    }

    @Test
    void cancelBooking_WithValidId_ShouldCancelBooking() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        adminBookingService.cancelBooking(1L);

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        verify(bookingRepository).findById(1L);
        verify(bookingRepository).save(booking);
    }

    @Test
    void cancelBooking_WithNonExistentId_ShouldThrowNotFoundException() {
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminBookingService.cancelBooking(999L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });

        verify(bookingRepository).findById(999L);
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void deleteBooking_WithValidId_ShouldDeleteBooking() {
        when(bookingRepository.existsById(1L)).thenReturn(true);
        doNothing().when(bookingRepository).deleteById(1L);

        adminBookingService.deleteBooking(1L);

        verify(bookingRepository).existsById(1L);
        verify(bookingRepository).deleteById(1L);
    }

    @Test
    void deleteBooking_WithNonExistentId_ShouldThrowNotFoundException() {
        when(bookingRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> adminBookingService.deleteBooking(999L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });

        verify(bookingRepository).existsById(999L);
        verify(bookingRepository, never()).deleteById(any());
    }

    @Test
    void getBookingsCount_ShouldReturnCount() {
        when(bookingRepository.count()).thenReturn(10L);

        long count = adminBookingService.getBookingsCount();

        assertThat(count).isEqualTo(10L);
        verify(bookingRepository).count();
    }

    @Test
    void getBookingsCountByDateRange_ShouldReturnCount() {
        LocalDateTime start = LocalDateTime.now().minusDays(1);
        LocalDateTime end = LocalDateTime.now();
        List<Booking> bookings = List.of(booking, booking);

        when(bookingRepository.findBookingsWithDetails(start, end)).thenReturn(bookings);

        long count = adminBookingService.getBookingsCountByDateRange(start, end);

        assertThat(count).isEqualTo(2L);
        verify(bookingRepository).findBookingsWithDetails(start, end);
    }
}