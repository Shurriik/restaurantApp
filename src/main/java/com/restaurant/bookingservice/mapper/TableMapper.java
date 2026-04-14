package com.restaurant.bookingservice.mapper;

import com.restaurant.bookingservice.dto.admin.TableAdminRequest;
import com.restaurant.bookingservice.dto.admin.TableAdminResponse;
import com.restaurant.bookingservice.dto.user.TableUserRequest;
import com.restaurant.bookingservice.dto.user.TableUserResponse;
import com.restaurant.bookingservice.model.RestaurantTable;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class TableMapper {

    public TableUserResponse toUserResponse(RestaurantTable table) {
        if (table == null) {
            return null;
        }

        return TableUserResponse.builder()
                .id(table.getId())
                .number(table.getNumber())
                .capacity(table.getCapacity())
                .location(table.getLocation())
                .available(table.getAvailable())
                .build();
    }

    public RestaurantTable toEntityFromUserRequest(TableUserRequest request) {
        if (request == null) {
            return null;
        }

        return RestaurantTable.builder()
                .number(request.getNumber())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .available(request.isAvailable())
                .build();
    }

    public List<TableUserResponse> toUserResponseList(List<RestaurantTable> tables) {
        if (tables == null) {
            return List.of();
        }
        return tables.stream().map(this::toUserResponse).toList();
    }

    public TableAdminResponse toAdminResponse(RestaurantTable table) {
        if (table == null) {
            return null;
        }

        return TableAdminResponse.builder()
                .id(table.getId())
                .number(table.getNumber())
                .capacity(table.getCapacity())
                .location(table.getLocation())
                .available(table.getAvailable())
                .build();
    }

    public RestaurantTable toEntityFromAdminRequest(TableAdminRequest request) {
        if (request == null) {
            return null;
        }

        return RestaurantTable.builder()
                .number(request.getNumber())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .available(request.isAvailable())
                .build();
    }

    public void updateEntityFromAdminRequest(RestaurantTable table, TableAdminRequest request) {
        if (table == null || request == null) {
            return;
        }

        table.setNumber(request.getNumber());
        table.setCapacity(request.getCapacity());
        table.setLocation(request.getLocation());
        table.setAvailable(request.isAvailable());
    }

    public List<TableAdminResponse> toAdminResponseList(List<RestaurantTable> tables) {
        if (tables == null) {
            return List.of();
        }
        return tables.stream().map(this::toAdminResponse).toList();
    }
}