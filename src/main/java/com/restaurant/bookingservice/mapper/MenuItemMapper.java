package com.restaurant.bookingservice.mapper;

import com.restaurant.bookingservice.dto.menu.MenuItemRequest;
import com.restaurant.bookingservice.dto.menu.MenuItemResponse;
import com.restaurant.bookingservice.model.MenuItem;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MenuItemMapper {

    private final TagMapper tagMapper;

    public MenuItemResponse toResponse(MenuItem menuItem) {
        if (menuItem == null) {
            return null;
        }

        return MenuItemResponse.builder()
                .id(menuItem.getId())
                .name(menuItem.getName())
                .price(menuItem.getPrice())
                .tags(menuItem.getTags() != null
                        ? menuItem.getTags().stream()
                                .map(tagMapper::toResponse)
                                .collect(Collectors.toSet()) :
                        null)
                .build();
    }

    public MenuItem toEntity(MenuItemRequest request) {
        if (request == null) {
            return null;
        }

        return MenuItem.builder()
                .name(request.getName())
                .price(request.getPrice())
                .build();
    }
}