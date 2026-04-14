package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.menu.MenuItemRequest;
import com.restaurant.bookingservice.dto.menu.MenuItemResponse;
import com.restaurant.bookingservice.mapper.MenuItemMapper;
import com.restaurant.bookingservice.model.MenuItem;
import com.restaurant.bookingservice.model.Tag;
import com.restaurant.bookingservice.repository.MenuItemRepository;
import com.restaurant.bookingservice.repository.TagRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("MenuService Unit Tests")
class MenuServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private MenuItemMapper menuItemMapper;

    @InjectMocks
    private MenuService menuService;

    private MenuItem menuItem;
    private MenuItemRequest request;
    private MenuItemResponse response;
    private Tag tag;

    @BeforeEach
    void setUp() {
        tag = Tag.builder()
                .id(1L)
                .name("VEGETARIAN")
                .menuItems(new HashSet<>())
                .build();

        menuItem = MenuItem.builder()
                .id(1L)
                .name("Test Dish")
                .price(new BigDecimal("15.50"))
                .tags(new HashSet<>())
                .build();
        menuItem.getTags().add(tag);
        tag.getMenuItems().add(menuItem);

        request = MenuItemRequest.builder()
                .name("Test Dish")
                .price(new BigDecimal("15.50"))
                .tagIds(Set.of(1L))
                .build();

        response = MenuItemResponse.builder()
                .id(1L)
                .name("Test Dish")
                .price(new BigDecimal("15.50"))
                .build();
    }

    @Test
    @DisplayName("getAllMenuItems")
    void shouldReturnAllMenuItems() {
        when(menuItemRepository.findAllWithTags()).thenReturn(List.of(menuItem));
        when(menuItemMapper.toResponse(menuItem)).thenReturn(response);

        List<MenuItemResponse> result = menuService.getAllMenuItems();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getMenuItemById - найдено")
    void shouldReturnMenuItemWhenExists() {
        when(menuItemRepository.findByIdWithTags(1L)).thenReturn(menuItem);
        when(menuItemMapper.toResponse(menuItem)).thenReturn(response);

        MenuItemResponse result = menuService.getMenuItemById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getMenuItemById - не найдено")
    void shouldThrowExceptionWhenMenuItemNotFound() {
        when(menuItemRepository.findByIdWithTags(1L)).thenReturn(null);

        assertThatThrownBy(() -> menuService.getMenuItemById(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Блюдо с ID 1 не найдено");
    }

    @Test
    @DisplayName("getMenuItemsByTagId")
    void shouldReturnMenuItemsByTagId() {
        when(menuItemRepository.findByTagId(1L)).thenReturn(List.of(menuItem));
        when(menuItemMapper.toResponse(menuItem)).thenReturn(response);

        List<MenuItemResponse> result = menuService.getMenuItemsByTagId(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("createMenuItem - без тегов (tagIds = null)")
    void shouldCreateMenuItemWithNullTagIds() {
        MenuItemRequest requestWithNullTags = MenuItemRequest.builder()
                .name("Null Tags Dish")
                .price(new BigDecimal("15.50"))
                .tagIds(null)
                .build();

        MenuItem newMenuItem = MenuItem.builder()
                .id(1L)
                .name("Null Tags Dish")
                .price(new BigDecimal("15.50"))
                .tags(new HashSet<>())
                .build();

        MenuItemResponse expectedResponse = MenuItemResponse.builder()
                .id(1L)
                .name("Null Tags Dish")
                .price(new BigDecimal("15.50"))
                .build();

        when(menuItemMapper.toEntity(requestWithNullTags)).thenReturn(newMenuItem);
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(newMenuItem);
        when(menuItemMapper.toResponse(newMenuItem)).thenReturn(expectedResponse);

        MenuItemResponse result = menuService.createMenuItem(requestWithNullTags);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Null Tags Dish");
        verify(tagRepository, never()).findById(any());
        verify(menuItemRepository, times(1)).save(any(MenuItem.class));
    }

    @Test
    @DisplayName("createMenuItem - с пустым списком тегов")
    void shouldCreateMenuItemWithEmptyTagIds() {
        MenuItemRequest requestWithEmptyTags = MenuItemRequest.builder()
                .name("Empty Tags Dish")
                .price(new BigDecimal("15.50"))
                .tagIds(new HashSet<>())
                .build();

        MenuItem newMenuItem = MenuItem.builder()
                .id(1L)
                .name("Empty Tags Dish")
                .price(new BigDecimal("15.50"))
                .tags(new HashSet<>())
                .build();

        MenuItemResponse expectedResponse = MenuItemResponse.builder()
                .id(1L)
                .name("Empty Tags Dish")
                .price(new BigDecimal("15.50"))
                .build();

        when(menuItemMapper.toEntity(requestWithEmptyTags)).thenReturn(newMenuItem);
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(newMenuItem);
        when(menuItemMapper.toResponse(newMenuItem)).thenReturn(expectedResponse);

        MenuItemResponse result = menuService.createMenuItem(requestWithEmptyTags);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Empty Tags Dish");
        verify(tagRepository, never()).findById(any());
        verify(menuItemRepository, times(1)).save(any(MenuItem.class));
    }

    @Test
    @DisplayName("createMenuItem - с тегами")
    void shouldCreateMenuItemWithTagsSuccessfully() {
        when(menuItemMapper.toEntity(request)).thenReturn(menuItem);
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(menuItem);
        when(menuItemMapper.toResponse(menuItem)).thenReturn(response);

        MenuItemResponse result = menuService.createMenuItem(request);

        assertThat(result).isNotNull();
        verify(tagRepository, times(1)).findById(1L);
        verify(menuItemRepository, times(1)).save(any(MenuItem.class));
    }

    @Test
    @DisplayName("createMenuItem - тег не найден")
    void shouldThrowExceptionWhenTagNotFoundForCreate() {
        when(menuItemMapper.toEntity(request)).thenReturn(menuItem);
        when(tagRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> menuService.createMenuItem(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Тег с ID 1 не найден");
        verify(menuItemRepository, never()).save(any(MenuItem.class));
    }

    @Test
    @DisplayName("updateMenuItem - успешно с тегами")
    void shouldUpdateMenuItemSuccessfully() {
        MenuItemRequest updateRequest = MenuItemRequest.builder()
                .name("Updated Dish With Tags")
                .price(new BigDecimal("20.00"))
                .tagIds(Set.of(1L))
                .build();

        MenuItem updatedMenuItem = MenuItem.builder()
                .id(1L)
                .name("Updated Dish With Tags")
                .price(new BigDecimal("20.00"))
                .tags(new HashSet<>())
                .build();

        MenuItemResponse expectedResponse = MenuItemResponse.builder()
                .id(1L)
                .name("Updated Dish With Tags")
                .price(new BigDecimal("20.00"))
                .build();

        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(updatedMenuItem);
        when(menuItemMapper.toResponse(updatedMenuItem)).thenReturn(expectedResponse);

        MenuItemResponse result = menuService.updateMenuItem(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Updated Dish With Tags");
        verify(menuItemRepository, times(1)).save(any(MenuItem.class));
    }

    @Test
    @DisplayName("updateMenuItem - без тегов (tagIds = null)")
    void shouldUpdateMenuItemWithNullTagIds() {
        MenuItemRequest updateRequest = MenuItemRequest.builder()
                .name("Updated Dish Null Tags")
                .price(new BigDecimal("20.00"))
                .tagIds(null)
                .build();

        MenuItem updatedMenuItem = MenuItem.builder()
                .id(1L)
                .name("Updated Dish Null Tags")
                .price(new BigDecimal("20.00"))
                .tags(new HashSet<>())
                .build();

        MenuItemResponse expectedResponse = MenuItemResponse.builder()
                .id(1L)
                .name("Updated Dish Null Tags")
                .price(new BigDecimal("20.00"))
                .build();

        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(updatedMenuItem);
        when(menuItemMapper.toResponse(updatedMenuItem)).thenReturn(expectedResponse);

        MenuItemResponse result = menuService.updateMenuItem(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Updated Dish Null Tags");
        verify(tagRepository, never()).findById(any());
        verify(menuItemRepository, times(1)).save(any(MenuItem.class));
    }

    @Test
    @DisplayName("updateMenuItem - с пустым списком тегов")
    void shouldUpdateMenuItemWithEmptyTagList() {
        MenuItemRequest updateRequest = MenuItemRequest.builder()
                .name("Updated Dish Empty Tags")
                .price(new BigDecimal("20.00"))
                .tagIds(new HashSet<>())
                .build();

        MenuItem updatedMenuItem = MenuItem.builder()
                .id(1L)
                .name("Updated Dish Empty Tags")
                .price(new BigDecimal("20.00"))
                .tags(new HashSet<>())
                .build();

        MenuItemResponse expectedResponse = MenuItemResponse.builder()
                .id(1L)
                .name("Updated Dish Empty Tags")
                .price(new BigDecimal("20.00"))
                .build();

        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(updatedMenuItem);
        when(menuItemMapper.toResponse(updatedMenuItem)).thenReturn(expectedResponse);

        MenuItemResponse result = menuService.updateMenuItem(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Updated Dish Empty Tags");
        verify(tagRepository, never()).findById(any());
        verify(menuItemRepository, times(1)).save(any(MenuItem.class));
    }

    @Test
    @DisplayName("updateMenuItem - не найдено")
    void shouldThrowExceptionWhenMenuItemNotFoundForUpdate() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> menuService.updateMenuItem(1L, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Блюдо с ID 1 не найдено");
    }

    @Test
    @DisplayName("updateMenuItem - тег не найден")
    void shouldThrowExceptionWhenTagNotFoundForUpdate() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(tagRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> menuService.updateMenuItem(1L, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Тег с ID 1 не найден");
    }

    @Test
    @DisplayName("addTagsToMenuItem - успешно")
    void shouldAddTagsToMenuItem() {
        Tag newTag = Tag.builder()
                .id(2L)
                .name("SPICY")
                .menuItems(new HashSet<>())
                .build();

        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(tagRepository.findById(2L)).thenReturn(Optional.of(newTag));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(menuItem);
        when(menuItemMapper.toResponse(menuItem)).thenReturn(response);

        MenuItemResponse result = menuService.addTagsToMenuItem(1L, List.of(2L));

        assertThat(result).isNotNull();
        verify(menuItemRepository, times(1)).save(any(MenuItem.class));
    }

    @Test
    @DisplayName("addTagsToMenuItem - блюдо не найдено")
    void shouldThrowExceptionWhenMenuItemNotFoundForAddTags() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());
        List<Long> tagIds = List.of(1L);

        assertThatThrownBy(() -> menuService.addTagsToMenuItem(1L, tagIds))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Блюдо с ID 1 не найдено");
    }

    @Test
    @DisplayName("addTagsToMenuItem - тег не найден")
    void shouldThrowExceptionWhenTagNotFoundForAddTags() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(tagRepository.findById(2L)).thenReturn(Optional.empty());
        List<Long> tagIds = List.of(2L);

        assertThatThrownBy(() -> menuService.addTagsToMenuItem(1L, tagIds))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Тег с ID 2 не найден");
    }

    @Test
    @DisplayName("removeTagsFromMenuItem - успешно")
    void shouldRemoveTagsFromMenuItem() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(menuItem);
        when(menuItemMapper.toResponse(menuItem)).thenReturn(response);

        MenuItemResponse result = menuService.removeTagsFromMenuItem(1L, List.of(1L));

        assertThat(result).isNotNull();
        verify(menuItemRepository, times(1)).save(any(MenuItem.class));
    }

    @Test
    @DisplayName("removeTagsFromMenuItem - блюдо не найдено")
    void shouldThrowExceptionWhenMenuItemNotFoundForRemoveTags() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());
        List<Long> tagIds = List.of(1L);

        assertThatThrownBy(() -> menuService.removeTagsFromMenuItem(1L, tagIds))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Блюдо с ID 1 не найдено");
    }

    @Test
    @DisplayName("removeTagsFromMenuItem - тег не найден")
    void shouldThrowExceptionWhenTagNotFoundForRemoveTags() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(tagRepository.findById(2L)).thenReturn(Optional.empty());
        List<Long> tagIds = List.of(2L);

        assertThatThrownBy(() -> menuService.removeTagsFromMenuItem(1L, tagIds))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Тег с ID 2 не найден");
    }

    @Test
    @DisplayName("deleteMenuItem - успешно")
    void shouldDeleteMenuItemSuccessfully() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        doNothing().when(menuItemRepository).delete(menuItem);

        menuService.deleteMenuItem(1L);

        verify(menuItemRepository, times(1)).delete(menuItem);
    }

    @Test
    @DisplayName("deleteMenuItem - не найдено")
    void shouldThrowExceptionWhenMenuItemNotFoundForDelete() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> menuService.deleteMenuItem(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Блюдо с ID 1 не найдено");
    }
}