package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.user.TableUserRequest;
import com.restaurant.bookingservice.dto.user.TableUserResponse;
import com.restaurant.bookingservice.enums.TableLocation;
import com.restaurant.bookingservice.mapper.TableMapper;
import com.restaurant.bookingservice.model.RestaurantTable;
import com.restaurant.bookingservice.repository.TableRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


@Service
@RequiredArgsConstructor
public class TableService {

    private static final String TABLE_NOT_FOUND_MESSAGE = "Стол с ID %d не найден";
    private static final String TABLE_NUMBER_EXISTS_MESSAGE = "Стол с номером %d уже существует";

    private final TableRepository tableRepository;
    private final TableMapper tableMapper;

    private void validateTableNumber(Long id, Integer number) {
        if (tableRepository.existsByNumber(number)
                &&
                (id == null || !tableRepository.findById(id)
                        .map(t -> t.getNumber().equals(number)).orElse(false))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format(TABLE_NUMBER_EXISTS_MESSAGE, number));
        }
    }

    public TableUserResponse createTableForUser(TableUserRequest request) {
        validateTableNumber(null, request.getNumber());

        RestaurantTable table = tableMapper.toEntityFromUserRequest(request);
        RestaurantTable savedTable = tableRepository.save(table);

        return tableMapper.toUserResponse(savedTable);
    }

    public List<TableUserResponse> getAllTableForUser() {
        List<RestaurantTable> tables = tableRepository.findAll();
        return tableMapper.toUserResponseList(tables);
    }

    public TableUserResponse getTableByIdForUser(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(TABLE_NOT_FOUND_MESSAGE, id)));
        return tableMapper.toUserResponse(table);
    }

    @Transactional
    public TableUserResponse updateTableForUser(Long id, TableUserRequest request) {
        RestaurantTable existingTable = tableRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(TABLE_NOT_FOUND_MESSAGE, id)));

        validateTableNumber(id, request.getNumber());

        existingTable.setNumber(request.getNumber());
        existingTable.setCapacity(request.getCapacity());
        existingTable.setLocation(request.getLocation());
        existingTable.setAvailable(request.isAvailable());

        RestaurantTable updatedTable = tableRepository.save(existingTable);
        return tableMapper.toUserResponse(updatedTable);
    }

    @Transactional
    public boolean deleteTableForUser(Long id) {
        if (!tableRepository.existsById(id)) {
            return false;
        }
        tableRepository.deleteById(id);
        return true;
    }

    public List<TableUserResponse> getTableByFilterForUser(Integer minCapacity,
                                                           TableLocation location,
                                                           Boolean available) {
        List<RestaurantTable> tables = tableRepository.findAll();

        return tables.stream()
                .filter(t -> minCapacity == null || t.getCapacity() >= minCapacity)
                .filter(t -> location == null || location.equals(t.getLocation()))
                .filter(t -> available == null || available.equals(t.getAvailable()))
                .map(tableMapper::toUserResponse)
                .toList();
    }
}