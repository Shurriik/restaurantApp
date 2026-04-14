package com.restaurant.bookingservice.mapper;

import com.restaurant.bookingservice.dto.tag.TagRequest;
import com.restaurant.bookingservice.dto.tag.TagResponse;
import com.restaurant.bookingservice.model.Tag;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class TagMapper {

    public TagResponse toResponse(Tag tag) {
        if (tag == null) {
            return null;
        }

        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .menuItemsCount(tag.getMenuItems() != null ? tag.getMenuItems().size() : 0)
                .build();
    }

    public Tag toEntity(TagRequest request) {
        if (request == null) {
            return null;
        }

        return Tag.builder()
                .name(request.getName())
                .build();
    }

    public List<TagResponse> toResponseList(List<Tag> tags) {
        if (tags == null) {
            return List.of();
        }
        return tags.stream().map(this::toResponse).toList();
    }
}