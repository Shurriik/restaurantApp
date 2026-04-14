package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.menu.MenuItemRequest;
import com.restaurant.bookingservice.dto.menu.MenuItemResponse;
import com.restaurant.bookingservice.mapper.MenuItemMapper;
import com.restaurant.bookingservice.model.MenuItem;
import com.restaurant.bookingservice.model.Tag;
import com.restaurant.bookingservice.repository.MenuItemRepository;
import com.restaurant.bookingservice.repository.TagRepository;
import java.util.HashSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MenuService {

    private static final String MENU_ITEM_NOT_FOUND_MESSAGE = "Блюдо с ID %d не найдено";
    private static final String TAG_NOT_FOUND_MESSAGE = "Тег с ID %d не найден";

    private final MenuItemRepository menuItemRepository;
    private final TagRepository tagRepository;
    private final MenuItemMapper menuItemMapper;

    public List<MenuItemResponse> getAllMenuItems() {
        return menuItemRepository.findAllWithTags().stream()
                .map(menuItemMapper::toResponse)
                .toList();
    }

    public MenuItemResponse getMenuItemById(Long id) {
        MenuItem menuItem = menuItemRepository.findByIdWithTags(id);
        if (menuItem == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    String.format(MENU_ITEM_NOT_FOUND_MESSAGE, id));
        }
        return menuItemMapper.toResponse(menuItem);
    }

    public List<MenuItemResponse> getMenuItemsByTagId(Long tagId) {
        return menuItemRepository.findByTagId(tagId).stream()
                .map(menuItemMapper::toResponse)
                .toList();
    }

    @Transactional
    public MenuItemResponse createMenuItem(MenuItemRequest request) {
        MenuItem menuItem = menuItemMapper.toEntity(request);

        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            menuItem.setTags(new HashSet<>());
            for (Long tagId : request.getTagIds()) {
                Tag tag = tagRepository.findById(tagId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                String.format(TAG_NOT_FOUND_MESSAGE, tagId)));
                menuItem.addTag(tag);
            }
        }

        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        return menuItemMapper.toResponse(savedMenuItem);
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(MENU_ITEM_NOT_FOUND_MESSAGE, id)));

        menuItem.setName(request.getName());
        menuItem.setPrice(request.getPrice());

        menuItem.removeAllTags();
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            for (Long tagId : request.getTagIds()) {
                Tag tag = tagRepository.findById(tagId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                String.format(TAG_NOT_FOUND_MESSAGE, tagId)));
                menuItem.addTag(tag);
            }
        }

        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        return menuItemMapper.toResponse(updatedMenuItem);
    }

    @Transactional
    public MenuItemResponse addTagsToMenuItem(Long menuItemId, List<Long> tagIds) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(MENU_ITEM_NOT_FOUND_MESSAGE, menuItemId)));

        for (Long tagId : tagIds) {
            Tag tag = tagRepository.findById(tagId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            String.format(TAG_NOT_FOUND_MESSAGE, tagId)));
            menuItem.addTag(tag);
        }

        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        return menuItemMapper.toResponse(updatedMenuItem);
    }

    @Transactional
    public MenuItemResponse removeTagsFromMenuItem(Long menuItemId, List<Long> tagIds) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(MENU_ITEM_NOT_FOUND_MESSAGE, menuItemId)));

        for (Long tagId : tagIds) {
            Tag tag = tagRepository.findById(tagId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            String.format(TAG_NOT_FOUND_MESSAGE, tagId)));
            menuItem.removeTag(tag);
        }

        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        return menuItemMapper.toResponse(updatedMenuItem);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(MENU_ITEM_NOT_FOUND_MESSAGE, id)));

        menuItem.removeAllTags();
        menuItemRepository.delete(menuItem);
    }
}