package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.admin.TableAdminRequest;
import com.restaurant.bookingservice.dto.admin.TableAdminResponse;
import com.restaurant.bookingservice.mapper.TableMapper;
import com.restaurant.bookingservice.model.RestaurantTable;
import com.restaurant.bookingservice.repository.TableRepository;
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
public class AdminTableService {

    private static final String TABLE_NOT_FOUND_MESSAGE = "Стол с ID %d не найден";
    private static final String TABLE_NUMBER_EXISTS_MESSAGE = "Стол с номером %d уже существует";

    private final TableRepository tableRepository;
    private final TableMapper tableMapper;

    private void validateTableNumber(Long id, Integer number) {
        if (tableRepository.existsByNumber(number)
                &&
                (id == null || !tableRepository.findById(id).map(
                        t -> t.getNumber().equals(number)).orElse(false))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format(TABLE_NUMBER_EXISTS_MESSAGE, number));
        }
    }

    public TableAdminResponse createTable(TableAdminRequest request) {
        validateTableNumber(null, request.getNumber());

        RestaurantTable table = tableMapper.toEntityFromAdminRequest(request);
        RestaurantTable savedTable = tableRepository.save(table);
        return tableMapper.toAdminResponse(savedTable);
    }

    public List<TableAdminResponse> getAllTables() {
        return tableMapper.toAdminResponseList(tableRepository.findAll());
    }

    public TableAdminResponse getTableById(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(TABLE_NOT_FOUND_MESSAGE, id)));
        return tableMapper.toAdminResponse(table);
    }

    @Transactional
    public TableAdminResponse updateTable(Long id, TableAdminRequest request) {
        RestaurantTable existingTable = tableRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(TABLE_NOT_FOUND_MESSAGE, id)));

        validateTableNumber(id, request.getNumber());

        tableMapper.updateEntityFromAdminRequest(existingTable, request);
        RestaurantTable updatedTable = tableRepository.save(existingTable);
        return tableMapper.toAdminResponse(updatedTable);
    }

    @Transactional
    public void deleteTable(Long id) {
        if (!tableRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    String.format(TABLE_NOT_FOUND_MESSAGE, id));
        }
        tableRepository.deleteById(id);
        log.info("Стол с ID {} удален", id);
    }

    public long getTablesCount() {
        return tableRepository.count();
    }
}