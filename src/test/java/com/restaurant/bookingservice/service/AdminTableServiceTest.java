package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.admin.TableAdminRequest;
import com.restaurant.bookingservice.dto.admin.TableAdminResponse;
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
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminTableService Unit Tests")
class AdminTableServiceTest {

    @Mock
    private TableRepository tableRepository;

    @Mock
    private TableMapper tableMapper;

    @InjectMocks
    private AdminTableService adminTableService;

    private RestaurantTable table;
    private TableAdminRequest tableRequest;
    private TableAdminResponse tableResponse;

    @BeforeEach
    void setUp() {
        table = new RestaurantTable();
        table.setId(1L);
        table.setNumber(1);
        table.setCapacity(4);

        tableRequest = new TableAdminRequest();
        tableRequest.setNumber(1);
        tableRequest.setCapacity(4);

        tableResponse = new TableAdminResponse();
        tableResponse.setId(1L);
        tableResponse.setNumber(1);
        tableResponse.setCapacity(4);
    }

    @Test
    @DisplayName("createTable - успешно")
    void shouldCreateTableSuccessfully() {
        when(tableRepository.existsByNumber(tableRequest.getNumber())).thenReturn(false);
        when(tableMapper.toEntityFromAdminRequest(tableRequest)).thenReturn(table);
        when(tableRepository.save(table)).thenReturn(table);
        when(tableMapper.toAdminResponse(table)).thenReturn(tableResponse);

        TableAdminResponse result = adminTableService.createTable(tableRequest);

        assertThat(result.getId()).isEqualTo(1L);
        verify(tableRepository).existsByNumber(tableRequest.getNumber());
        verify(tableMapper).toEntityFromAdminRequest(tableRequest);
        verify(tableRepository).save(table);
        verify(tableMapper).toAdminResponse(table);
    }

    @Test
    @DisplayName("createTable - номер уже существует")
    void shouldThrowExceptionWhenNumberExists() {
        when(tableRepository.existsByNumber(tableRequest.getNumber())).thenReturn(true);

        assertThatThrownBy(() -> adminTableService.createTable(tableRequest))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                });

        verify(tableRepository).existsByNumber(tableRequest.getNumber());
        verify(tableRepository, never()).save(any());
    }

    @Test
    @DisplayName("getAllTables")
    void shouldReturnAllTables() {
        List<RestaurantTable> tables = List.of(table);
        List<TableAdminResponse> expectedResponses = List.of(tableResponse);

        when(tableRepository.findAll()).thenReturn(tables);
        when(tableMapper.toAdminResponseList(tables)).thenReturn(expectedResponses);

        List<TableAdminResponse> result = adminTableService.getAllTables();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getTableById - найдено")
    void shouldReturnTableWhenExists() {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(table));
        when(tableMapper.toAdminResponse(table)).thenReturn(tableResponse);

        TableAdminResponse result = adminTableService.getTableById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        verify(tableRepository).findById(1L);
    }

    @Test
    @DisplayName("getTableById - не найдено")
    void shouldThrowExceptionWhenTableNotFound() {
        when(tableRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminTableService.getTableById(999L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });
    }

    @Test
    @DisplayName("updateTable - успешно")
    void shouldUpdateTableSuccessfully() {
        TableAdminRequest updateRequest = new TableAdminRequest();
        updateRequest.setNumber(2);
        updateRequest.setCapacity(6);

        RestaurantTable existingTable = new RestaurantTable();
        existingTable.setId(1L);
        existingTable.setNumber(1);
        existingTable.setCapacity(4);

        RestaurantTable updatedTable = new RestaurantTable();
        updatedTable.setId(1L);
        updatedTable.setNumber(2);
        updatedTable.setCapacity(6);

        TableAdminResponse updatedResponse = new TableAdminResponse();
        updatedResponse.setId(1L);
        updatedResponse.setNumber(2);
        updatedResponse.setCapacity(6);

        when(tableRepository.findById(1L)).thenReturn(Optional.of(existingTable));
        when(tableRepository.existsByNumber(updateRequest.getNumber())).thenReturn(false);
        when(tableRepository.save(any(RestaurantTable.class))).thenReturn(updatedTable);
        when(tableMapper.toAdminResponse(updatedTable)).thenReturn(updatedResponse);

        TableAdminResponse result = adminTableService.updateTable(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getNumber()).isEqualTo(2);
        verify(tableRepository).findById(1L);
        verify(tableRepository).existsByNumber(updateRequest.getNumber());
        verify(tableMapper).updateEntityFromAdminRequest(existingTable, updateRequest);
        verify(tableRepository).save(existingTable);
        verify(tableMapper).toAdminResponse(updatedTable);
    }

    @Test
    @DisplayName("updateTable - не найдено")
    void shouldThrowExceptionWhenTableNotFoundForUpdate() {
        TableAdminRequest updateRequest = new TableAdminRequest();
        updateRequest.setNumber(2);

        when(tableRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminTableService.updateTable(999L, updateRequest))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });
    }

    @Test
    @DisplayName("updateTable - номер уже существует у другого стола")
    void shouldThrowExceptionWhenNumberExistsForAnotherTable() {
        TableAdminRequest updateRequest = new TableAdminRequest();
        updateRequest.setNumber(2);
        updateRequest.setCapacity(6);

        RestaurantTable existingTable = new RestaurantTable();
        existingTable.setId(1L);
        existingTable.setNumber(1);

        when(tableRepository.findById(1L)).thenReturn(Optional.of(existingTable));
        when(tableRepository.existsByNumber(updateRequest.getNumber())).thenReturn(true);

        assertThatThrownBy(() -> adminTableService.updateTable(1L, updateRequest))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                });

        verify(tableRepository, atLeast(1)).findById(1L);
        verify(tableRepository).existsByNumber(updateRequest.getNumber());
        verify(tableRepository, never()).save(any());
    }

    @Test
    @DisplayName("deleteTable - успешно")
    void shouldDeleteTableSuccessfully() {
        when(tableRepository.existsById(1L)).thenReturn(true);
        doNothing().when(tableRepository).deleteById(1L);

        adminTableService.deleteTable(1L);

        verify(tableRepository).existsById(1L);
        verify(tableRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteTable - не найдено")
    void shouldThrowExceptionWhenTableNotFoundForDelete() {
        when(tableRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> adminTableService.deleteTable(999L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException responseEx = (ResponseStatusException) ex;
                    assertThat(responseEx.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });
    }

    @Test
    @DisplayName("getTablesCount")
    void shouldReturnTablesCount() {
        when(tableRepository.count()).thenReturn(8L);

        long count = adminTableService.getTablesCount();

        assertThat(count).isEqualTo(8L);
        verify(tableRepository).count();
    }

    @Test
    @DisplayName("updateTable - номер не меняется (обновление без конфликта)")
    void shouldUpdateTableWhenNumberNotChanged() {
        TableAdminRequest updateRequest = new TableAdminRequest();
        updateRequest.setNumber(1);
        updateRequest.setCapacity(6);

        RestaurantTable existingTable = new RestaurantTable();
        existingTable.setId(1L);
        existingTable.setNumber(1);
        existingTable.setCapacity(4);

        RestaurantTable updatedTable = new RestaurantTable();
        updatedTable.setId(1L);
        updatedTable.setNumber(1);
        updatedTable.setCapacity(6);

        TableAdminResponse updatedResponse = new TableAdminResponse();
        updatedResponse.setId(1L);
        updatedResponse.setNumber(1);
        updatedResponse.setCapacity(6);

        when(tableRepository.findById(1L)).thenReturn(Optional.of(existingTable));
        when(tableRepository.existsByNumber(1)).thenReturn(true);
        when(tableRepository.save(any(RestaurantTable.class))).thenReturn(updatedTable);
        when(tableMapper.toAdminResponse(updatedTable)).thenReturn(updatedResponse);

        TableAdminResponse result = adminTableService.updateTable(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getNumber()).isEqualTo(1);
        verify(tableRepository, times(1)).existsByNumber(1);
        verify(tableRepository).save(existingTable);
    }

    @Test
    @DisplayName("updateTable - номер существует у текущего стола (проверка условия id != null)")
    void shouldUpdateTableWhenNumberExistsForSameTable() {
        TableAdminRequest updateRequest = new TableAdminRequest();
        updateRequest.setNumber(2);
        updateRequest.setCapacity(6);

        RestaurantTable existingTable = new RestaurantTable();
        existingTable.setId(1L);
        existingTable.setNumber(2);

        RestaurantTable updatedTable = new RestaurantTable();
        updatedTable.setId(1L);
        updatedTable.setNumber(2);
        updatedTable.setCapacity(6);

        TableAdminResponse updatedResponse = new TableAdminResponse();
        updatedResponse.setId(1L);
        updatedResponse.setNumber(2);
        updatedResponse.setCapacity(6);

        when(tableRepository.findById(1L)).thenReturn(Optional.of(existingTable));
        when(tableRepository.existsByNumber(2)).thenReturn(true);
        when(tableRepository.findById(1L)).thenReturn(Optional.of(existingTable));
        when(tableRepository.save(any(RestaurantTable.class))).thenReturn(updatedTable);
        when(tableMapper.toAdminResponse(updatedTable)).thenReturn(updatedResponse);

        TableAdminResponse result = adminTableService.updateTable(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getNumber()).isEqualTo(2);
    }
}