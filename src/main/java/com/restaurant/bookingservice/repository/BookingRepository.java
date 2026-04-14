package com.restaurant.bookingservice.repository;

import com.restaurant.bookingservice.enums.BookingStatus;
import com.restaurant.bookingservice.model.Booking;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByTableIdAndStartTimeBetween(Long tableId,
                                                   LocalDateTime start, LocalDateTime end);

    @EntityGraph(attributePaths = {"customer", "table"})
    @Query("SELECT b FROM Booking b WHERE b.startTime BETWEEN :start AND :end")
    List<Booking> findBookingsWithDetails(@Param("start") LocalDateTime start,
                                          @Param("end") LocalDateTime end);

    @EntityGraph(attributePaths = {"customer", "table"})
    @Query("SELECT b FROM Booking b")
    List<Booking> findAllWithDetails();

    List<Booking> findByStatus(BookingStatus status);

    @EntityGraph(attributePaths = {"customer", "table"})
    @Query("SELECT b FROM Booking b "
            + "WHERE b.customer.name LIKE %:customerName% "
            + "AND b.table.capacity >= :minCapacity "
            + "AND b.status = :status "
            + "AND b.startTime >= :startDate")
    List<Booking> findBookingsByComplexCriteriaJpql(
            @Param("customerName") String customerName,
            @Param("minCapacity") Integer minCapacity,
            @Param("status") BookingStatus status,
            @Param("startDate") LocalDateTime startDate);

    @Query(value = "SELECT b.* FROM bookings b "
            + "JOIN customers c ON b.customer_id = c.id "
            + "JOIN restaurant_tables t ON b.table_id = t.id "
            + "WHERE c.name ILIKE CONCAT('%', :customerName, '%') "
            + "AND t.capacity >= :minCapacity "
            + "AND b.status::text = :status "
            + "AND b.start_time >= :startDate", nativeQuery = true)
    List<Booking> findBookingsByComplexCriteriaNative(
            @Param("customerName") String customerName,
            @Param("minCapacity") Integer minCapacity,
            @Param("status") String status,
            @Param("startDate") LocalDateTime startDate);

    @EntityGraph(attributePaths = {"customer", "table"})
    @Query("SELECT b FROM Booking b "
            + "WHERE b.customer.name LIKE %:customerName% "
            + "AND b.table.capacity >= :minCapacity "
            + "AND b.status = :status")
    Page<Booking> findBookingsWithPagination(
            @Param("customerName") String customerName,
            @Param("minCapacity") Integer minCapacity,
            @Param("status") BookingStatus status,
            Pageable pageable);
}