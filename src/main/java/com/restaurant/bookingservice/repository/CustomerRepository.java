package com.restaurant.bookingservice.repository;

import com.restaurant.bookingservice.model.Customer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.bookings WHERE c.id = :id")
    Optional<Customer> findByIdWithBookings(@Param("id") Long id);

    Optional<Customer> findByPhone(String phone);
}