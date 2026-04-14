package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.user.TableUserRequest;
import com.restaurant.bookingservice.dto.user.TableUserResponse;
import com.restaurant.bookingservice.enums.TableLocation;
import com.restaurant.bookingservice.mapper.TableMapper;
import com.restaurant.bookingservice.model.RestaurantTable;
import com.restaurant.bookingservice.repository.TableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.anyList;
import static org.mockito.Mockito.anyLong;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("TableService Unit Tests")
class TableServiceTest {

    @Mock
    private TableRepository tableRepository;

    @Mock
    private TableMapper tableMapper;

    @InjectMocks
    private TableService tableService;

    private RestaurantTable table;
    private TableUserRequest request;
    private TableUserResponse response;

    @BeforeEach
    void setUp() {
        table = RestaurantTable.builder()
                .id(1L)
                .number(5)
                .capacity(4)
                .location(TableLocation.MAIN_HALL)
                .available(true)
                .build();

        request = TableUserRequest.builder()
                .number(5)
                .capacity(4)
                .location(TableLocation.MAIN_HALL)
                .available(true)
                .build();

        response = TableUserResponse.builder()
                .id(1L)
                .number(5)
                .capacity(4)
                .location(TableLocation.MAIN_HALL)
                .available(true)
                .build();
    }

    @Test
    @DisplayName("createTableForUser - успешно")
    void shouldCreateTableForUserSuccessfully() {
        when(tableRepository.existsByNumber(5)).thenReturn(false);
        when(tableMapper.toEntityFromUserRequest(request)).thenReturn(table);
        when(tableRepository.save(any(RestaurantTable.class))).thenReturn(table);
        when(tableMapper.toUserResponse(table)).thenReturn(response);

        TableUserResponse result = tableService.createTableForUser(request);

        assertThat(result).isNotNull();
        assertThat(result.getNumber()).isEqualTo(5);
        verify(tableRepository, times(1)).save(any(RestaurantTable.class));
    }

    @Test
    @DisplayName("createTableForUser - номер уже существует")
    void shouldThrowExceptionWhenNumberAlreadyExists() {
        when(tableRepository.existsByNumber(5)).thenReturn(true);

        assertThatThrownBy(() -> tableService.createTableForUser(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Стол с номером 5 уже существует");
        verify(tableRepository, never()).save(any(RestaurantTable.class));
    }

    @Test
    @DisplayName("getAllTableForUser")
    void shouldReturnAllTablesForUser() {
        when(tableRepository.findAll()).thenReturn(List.of(table));
        when(tableMapper.toUserResponseList(anyList())).thenReturn(List.of(response));

        List<TableUserResponse> result = tableService.getAllTableForUser();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNumber()).isEqualTo(5);
    }

    @Test
    @DisplayName("getTableByIdForUser - найдено")
    void shouldReturnTableForUserWhenExists() {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(table));
        when(tableMapper.toUserResponse(table)).thenReturn(response);

        TableUserResponse result = tableService.getTableByIdForUser(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getTableByIdForUser - не найдено")
    void shouldThrowExceptionWhenTableNotFoundForUser() {
        when(tableRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tableService.getTableByIdForUser(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Стол с ID 1 не найден");
    }

    @Test
    @DisplayName("updateTableForUser - успешно")
    void shouldUpdateTableForUserSuccessfully() {
        TableUserRequest updateRequest = TableUserRequest.builder()
                .number(10)
                .capacity(6)
                .location(TableLocation.TERRACE)
                .available(false)
                .build();

        RestaurantTable updatedTable = RestaurantTable.builder()
                .id(1L)
                .number(10)
                .capacity(6)
                .location(TableLocation.TERRACE)
                .available(false)
                .build();

        TableUserResponse updatedResponse = TableUserResponse.builder()
                .id(1L)
                .number(10)
                .capacity(6)
                .location(TableLocation.TERRACE)
                .available(false)
                .build();

        when(tableRepository.findById(1L)).thenReturn(Optional.of(table));
        when(tableRepository.existsByNumber(10)).thenReturn(false);
        when(tableRepository.save(any(RestaurantTable.class))).thenReturn(updatedTable);
        when(tableMapper.toUserResponse(updatedTable)).thenReturn(updatedResponse);

        TableUserResponse result = tableService.updateTableForUser(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getNumber()).isEqualTo(10);
        verify(tableRepository, times(1)).save(any(RestaurantTable.class));
    }

    @Test
    @DisplayName("updateTableForUser - не найдено")
    void shouldThrowExceptionWhenTableNotFoundForUpdate() {
        when(tableRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tableService.updateTableForUser(1L, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Стол с ID 1 не найден");
    }

    @Test
    @DisplayName("updateTableForUser - номер уже существует у другого стола")
    void shouldThrowExceptionWhenNumberAlreadyExistsForAnotherTable() {
        TableUserRequest updateRequest = TableUserRequest.builder()
                .number(10)
                .capacity(6)
                .location(TableLocation.TERRACE)
                .available(false)
                .build();

        when(tableRepository.findById(1L)).thenReturn(Optional.of(table));
        when(tableRepository.existsByNumber(10)).thenReturn(true);

        assertThatThrownBy(() -> tableService.updateTableForUser(1L, updateRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Стол с номером 10 уже существует");

        verify(tableRepository, atLeast(1)).findById(1L);
        verify(tableRepository).existsByNumber(10);
        verify(tableRepository, never()).save(any(RestaurantTable.class));
    }

    @Test
    @DisplayName("deleteTableForUser - успешно")
    void shouldDeleteTableForUserSuccessfully() {
        when(tableRepository.existsById(1L)).thenReturn(true);
        doNothing().when(tableRepository).deleteById(1L);

        boolean result = tableService.deleteTableForUser(1L);

        assertThat(result).isTrue();
        verify(tableRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("deleteTableForUser - не найдено")
    void shouldReturnFalseWhenTableNotFoundForDelete() {
        when(tableRepository.existsById(1L)).thenReturn(false);

        boolean result = tableService.deleteTableForUser(1L);

        assertThat(result).isFalse();
        verify(tableRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("getTableByFilterForUser - все фильтры")
    void shouldReturnFilteredTables() {
        when(tableRepository.findAll()).thenReturn(List.of(table));
        when(tableMapper.toUserResponse(table)).thenReturn(response);

        List<TableUserResponse> result = tableService.getTableByFilterForUser(4, TableLocation.MAIN_HALL, true);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("getTableByFilterForUser - фильтр по вместимости")
    void shouldReturnEmptyWhenNoMatchingCapacity() {
        when(tableRepository.findAll()).thenReturn(List.of(table));

        List<TableUserResponse> result = tableService.getTableByFilterForUser(6, null, null);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getTableByFilterForUser - фильтр по локации")
    void shouldReturnEmptyWhenNoMatchingLocation() {
        when(tableRepository.findAll()).thenReturn(List.of(table));

        List<TableUserResponse> result = tableService.getTableByFilterForUser(null, TableLocation.TERRACE, null);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getTableByFilterForUser - фильтр по доступности")
    void shouldReturnEmptyWhenNoMatchingAvailability() {
        when(tableRepository.findAll()).thenReturn(List.of(table));

        List<TableUserResponse> result = tableService.getTableByFilterForUser(null, null, false);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getTableByFilterForUser - без фильтров")
    void shouldReturnAllTablesWhenNoFilters() {
        when(tableRepository.findAll()).thenReturn(List.of(table));
        when(tableMapper.toUserResponse(table)).thenReturn(response);

        List<TableUserResponse> result = tableService.getTableByFilterForUser(null, null, null);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("updateTableForUser - номер не меняется")
    void shouldUpdateTableWhenNumberNotChanged() {
        TableUserRequest updateRequest = TableUserRequest.builder()
                .number(5)
                .capacity(6)
                .location(TableLocation.TERRACE)
                .available(false)
                .build();

        RestaurantTable updatedTable = RestaurantTable.builder()
                .id(1L)
                .number(5)
                .capacity(6)
                .location(TableLocation.TERRACE)
                .available(false)
                .build();

        TableUserResponse updatedResponse = TableUserResponse.builder()
                .id(1L)
                .number(5)
                .capacity(6)
                .location(TableLocation.TERRACE)
                .available(false)
                .build();

        when(tableRepository.findById(1L)).thenReturn(Optional.of(table));
        when(tableRepository.existsByNumber(5)).thenReturn(true);
        when(tableRepository.save(any(RestaurantTable.class))).thenReturn(updatedTable);
        when(tableMapper.toUserResponse(updatedTable)).thenReturn(updatedResponse);

        TableUserResponse result = tableService.updateTableForUser(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getNumber()).isEqualTo(5);
        verify(tableRepository, times(1)).existsByNumber(5);
        verify(tableRepository).save(any(RestaurantTable.class));
    }
}