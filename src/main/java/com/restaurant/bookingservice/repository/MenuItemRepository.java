package com.restaurant.bookingservice.repository;

import com.restaurant.bookingservice.model.MenuItem;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    @Query("SELECT m FROM MenuItem m JOIN m.tags t WHERE t.id = :tagId")
    List<MenuItem> findByTagId(@Param("tagId") Long tagId);

    @EntityGraph(attributePaths = {"tags"})
    @Query("SELECT m FROM MenuItem m WHERE m.id = :id")
    MenuItem findByIdWithTags(@Param("id") Long id);

    @EntityGraph(attributePaths = {"tags"})
    @Query("SELECT m FROM MenuItem m")
    List<MenuItem> findAllWithTags();
}