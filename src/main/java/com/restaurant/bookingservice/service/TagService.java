package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.tag.TagRequest;
import com.restaurant.bookingservice.dto.tag.TagResponse;
import com.restaurant.bookingservice.mapper.TagMapper;
import com.restaurant.bookingservice.model.Tag;
import com.restaurant.bookingservice.repository.TagRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class TagService {

    private static final String TAG_NOT_FOUND_MESSAGE = "Тег с ID %d не найден";
    private static final String TAG_NAME_EXISTS_MESSAGE = "Тег с названием '%s' уже существует";
    private static final String TAG_IN_USE_MESSAGE =
            "Невозможно удалить тег, так как он используется в %d блюдах";

    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    public List<TagResponse> getAllTags() {
        List<Tag> tags = tagRepository.findAll();
        return tagMapper.toResponseList(tags);
    }

    public TagResponse getTagById(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(TAG_NOT_FOUND_MESSAGE, id)));
        return tagMapper.toResponse(tag);
    }

    public TagResponse getTagByName(String name) {
        Tag tag = tagRepository.findByName(name)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Тег с названием " + name + " не найден"));
        return tagMapper.toResponse(tag);
    }

    public List<TagResponse> getTagsWithMenuItems() {
        List<Tag> tags = tagRepository.findTagsWithMenuItems();
        return tagMapper.toResponseList(tags);
    }

    public List<TagResponse> getTagsWithoutMenuItems() {
        List<Tag> tags = tagRepository.findTagsWithoutMenuItems();
        return tagMapper.toResponseList(tags);
    }

    @Transactional
    public TagResponse createTag(TagRequest request) {
        if (tagRepository.existsByName(request.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format(TAG_NAME_EXISTS_MESSAGE, request.getName()));
        }

        Tag tag = tagMapper.toEntity(request);
        Tag savedTag = tagRepository.save(tag);
        log.info("Создан новый тег: {}", savedTag.getName());

        return tagMapper.toResponse(savedTag);
    }

    @Transactional
    public TagResponse updateTag(Long id, TagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(TAG_NOT_FOUND_MESSAGE, id)));

        if (!tag.getName().equals(request.getName())
                &&
                tagRepository.existsByName(request.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format(TAG_NAME_EXISTS_MESSAGE, request.getName()));
        }

        tag.setName(request.getName());

        Tag updatedTag = tagRepository.save(tag);
        log.info("Обновлен тег: {}", updatedTag.getName());

        return tagMapper.toResponse(updatedTag);
    }

    @Transactional
    public void deleteTag(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(TAG_NOT_FOUND_MESSAGE, id)));

        if (!tag.getMenuItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format(TAG_IN_USE_MESSAGE, tag.getMenuItems().size()));
        }

        tagRepository.delete(tag);
        log.info("Удален тег: {}", tag.getName());
    }
}