package com.restaurant.bookingservice.repository;

import com.restaurant.bookingservice.model.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TableRepository extends JpaRepository<RestaurantTable, Long> {

    boolean existsByNumber(Integer number);
}