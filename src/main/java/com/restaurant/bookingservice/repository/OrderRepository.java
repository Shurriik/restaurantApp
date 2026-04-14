package com.restaurant.bookingservice.repository;

import com.restaurant.bookingservice.model.Order;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByBookingId(Long bookingId);

    @EntityGraph(attributePaths = {"orderItems", "orderItems.menuItem"})
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Order findByIdWithItems(@Param("id") Long id);

    @EntityGraph(attributePaths = {"orderItems", "orderItems.menuItem"})
    @Query("SELECT o FROM Order o")
    List<Order> findAllWithItems();
}