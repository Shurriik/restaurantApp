package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.admin.BookingAdminResponse;
import com.restaurant.bookingservice.enums.BookingStatus;
import com.restaurant.bookingservice.mapper.BookingMapper;
import com.restaurant.bookingservice.model.Booking;
import com.restaurant.bookingservice.repository.BookingRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


@Service
@RequiredArgsConstructor
@Slf4j
public class AdminBookingService {

    private static final String BOOKING_NOT_FOUND_MESSAGE = "Бронирование с ID %d не найдено";

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    public List<BookingAdminResponse> getAllBookings() {
        return bookingMapper.toAdminResponseList(bookingRepository.findAll());
    }

    public List<BookingAdminResponse> getBookingsByStatus(BookingStatus status) {
        return bookingMapper.toAdminResponseList(bookingRepository.findByStatus(status));
    }

    public BookingAdminResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(BOOKING_NOT_FOUND_MESSAGE, id)));
        return bookingMapper.toAdminResponse(booking);
    }

    @Transactional
    public void cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(BOOKING_NOT_FOUND_MESSAGE, id)));
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        log.info("Бронирование с ID {} отменено", id);
    }

    @Transactional
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    String.format(BOOKING_NOT_FOUND_MESSAGE, id));
        }
        bookingRepository.deleteById(id);
        log.info("Бронирование с ID {} удалено", id);
    }

    public long getBookingsCount() {
        return bookingRepository.count();
    }

    public long getBookingsCountByDateRange(LocalDateTime start, LocalDateTime end) {
        return bookingRepository.findBookingsWithDetails(start, end).size();
    }
}