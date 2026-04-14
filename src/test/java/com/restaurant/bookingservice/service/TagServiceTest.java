package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.tag.TagRequest;
import com.restaurant.bookingservice.dto.tag.TagResponse;
import com.restaurant.bookingservice.mapper.TagMapper;
import com.restaurant.bookingservice.model.MenuItem;
import com.restaurant.bookingservice.model.Tag;
import com.restaurant.bookingservice.repository.TagRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.anyList;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("TagService Unit Tests")
class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @Mock
    private TagMapper tagMapper;

    @InjectMocks
    private TagService tagService;

    private Tag tag;
    private TagRequest request;
    private TagResponse response;
    private MenuItem menuItem;

    @BeforeEach
    void setUp() {
        tag = Tag.builder()
                .id(1L)
                .name("VEGETARIAN")
                .menuItems(new HashSet<>())
                .build();

        request = TagRequest.builder()
                .name("VEGETARIAN")
                .build();

        response = TagResponse.builder()
                .id(1L)
                .name("VEGETARIAN")
                .menuItemsCount(0)
                .build();

        menuItem = MenuItem.builder()
                .id(1L)
                .name("Test Dish")
                .build();
    }

    @Test
    @DisplayName("getAllTags")
    void shouldReturnAllTags() {
        when(tagRepository.findAll()).thenReturn(List.of(tag));
        when(tagMapper.toResponseList(anyList())).thenReturn(List.of(response));

        List<TagResponse> result = tagService.getAllTags();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getTagById - найдено")
    void shouldReturnTagWhenExists() {
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));
        when(tagMapper.toResponse(tag)).thenReturn(response);

        TagResponse result = tagService.getTagById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getTagById - не найдено")
    void shouldThrowExceptionWhenTagNotFound() {
        when(tagRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tagService.getTagById(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Тег с ID 1 не найден");
    }

    @Test
    @DisplayName("getTagByName - найдено")
    void shouldReturnTagByNameWhenExists() {
        when(tagRepository.findByName("VEGETARIAN")).thenReturn(Optional.of(tag));
        when(tagMapper.toResponse(tag)).thenReturn(response);

        TagResponse result = tagService.getTagByName("VEGETARIAN");

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("VEGETARIAN");
    }

    @Test
    @DisplayName("getTagByName - не найдено")
    void shouldThrowExceptionWhenTagNameNotFound() {
        when(tagRepository.findByName("VEGETARIAN")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tagService.getTagByName("VEGETARIAN"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Тег с названием VEGETARIAN не найден");
    }

    @Test
    @DisplayName("getTagsWithMenuItems")
    void shouldReturnTagsWithMenuItems() {
        tag.getMenuItems().add(menuItem);
        when(tagRepository.findTagsWithMenuItems()).thenReturn(List.of(tag));
        when(tagMapper.toResponseList(anyList())).thenReturn(List.of(response));

        List<TagResponse> result = tagService.getTagsWithMenuItems();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("getTagsWithoutMenuItems")
    void shouldReturnTagsWithoutMenuItems() {
        when(tagRepository.findTagsWithoutMenuItems()).thenReturn(List.of(tag));
        when(tagMapper.toResponseList(anyList())).thenReturn(List.of(response));

        List<TagResponse> result = tagService.getTagsWithoutMenuItems();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("createTag - успешно")
    void shouldCreateTagSuccessfully() {
        when(tagRepository.existsByName("VEGETARIAN")).thenReturn(false);
        when(tagMapper.toEntity(request)).thenReturn(tag);
        when(tagRepository.save(any(Tag.class))).thenReturn(tag);
        when(tagMapper.toResponse(tag)).thenReturn(response);

        TagResponse result = tagService.createTag(request);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("VEGETARIAN");
        verify(tagRepository, times(1)).save(any(Tag.class));
    }

    @Test
    @DisplayName("createTag - имя уже существует")
    void shouldThrowExceptionWhenTagNameExists() {
        when(tagRepository.existsByName("VEGETARIAN")).thenReturn(true);

        assertThatThrownBy(() -> tagService.createTag(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Тег с названием 'VEGETARIAN' уже существует");
        verify(tagRepository, never()).save(any(Tag.class));
    }

    @Test
    @DisplayName("updateTag - успешно")
    void shouldUpdateTagSuccessfully() {
        TagRequest updateRequest = TagRequest.builder()
                .name("VEGAN")
                .build();

        Tag updatedTag = Tag.builder()
                .id(1L)
                .name("VEGAN")
                .menuItems(new HashSet<>())
                .build();

        TagResponse updatedResponse = TagResponse.builder()
                .id(1L)
                .name("VEGAN")
                .menuItemsCount(0)
                .build();

        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));
        when(tagRepository.existsByName("VEGAN")).thenReturn(false);
        when(tagRepository.save(any(Tag.class))).thenReturn(updatedTag);
        when(tagMapper.toResponse(updatedTag)).thenReturn(updatedResponse);

        TagResponse result = tagService.updateTag(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("VEGAN");
        verify(tagRepository, times(1)).save(any(Tag.class));
    }

    @Test
    @DisplayName("updateTag - не найдено")
    void shouldThrowExceptionWhenTagNotFoundForUpdate() {
        when(tagRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tagService.updateTag(1L, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Тег с ID 1 не найден");
    }

    @Test
    @DisplayName("updateTag - имя уже существует у другого тега")
    void shouldThrowExceptionWhenTagNameExistsForAnotherTag() {
        TagRequest updateRequest = TagRequest.builder()
                .name("VEGAN")
                .build();

        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));
        when(tagRepository.existsByName("VEGAN")).thenReturn(true);

        assertThatThrownBy(() -> tagService.updateTag(1L, updateRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Тег с названием 'VEGAN' уже существует");
    }

    @Test
    @DisplayName("deleteTag - успешно")
    void shouldDeleteTagSuccessfully() {
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));
        doNothing().when(tagRepository).delete(tag);

        tagService.deleteTag(1L);

        verify(tagRepository, times(1)).delete(tag);
    }

    @Test
    @DisplayName("deleteTag - не найдено")
    void shouldThrowExceptionWhenTagNotFoundForDelete() {
        when(tagRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tagService.deleteTag(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Тег с ID 1 не найден");
    }

    @Test
    @DisplayName("deleteTag - используется в блюдах")
    void shouldThrowExceptionWhenTagIsInUse() {
        tag.getMenuItems().add(menuItem);
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));

        assertThatThrownBy(() -> tagService.deleteTag(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Невозможно удалить тег, так как он используется в 1 блюдах");
        verify(tagRepository, never()).delete(any(Tag.class));
    }

    @Test
    @DisplayName("updateTag - имя не меняется")
    void shouldUpdateTagWhenNameNotChanged() {
        TagRequest updateRequest = TagRequest.builder()
                .name("VEGETARIAN")
                .build();

        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));
        when(tagRepository.save(any(Tag.class))).thenReturn(tag);
        when(tagMapper.toResponse(tag)).thenReturn(response);

        TagResponse result = tagService.updateTag(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("VEGETARIAN");
        verify(tagRepository, never()).existsByName(any());
    }
}