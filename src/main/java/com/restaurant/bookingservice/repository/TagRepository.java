package com.restaurant.bookingservice.repository;

import com.restaurant.bookingservice.model.Tag;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT t FROM Tag t WHERE SIZE(t.menuItems) > 0")
    List<Tag> findTagsWithMenuItems();

    @Query("SELECT t FROM Tag t WHERE SIZE(t.menuItems) = 0")
    List<Tag> findTagsWithoutMenuItems();
}