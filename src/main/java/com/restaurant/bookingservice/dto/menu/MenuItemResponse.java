package com.restaurant.bookingservice.dto.menu;

import com.restaurant.bookingservice.dto.tag.TagResponse;
import java.math.BigDecimal;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private Set<TagResponse> tags;
}