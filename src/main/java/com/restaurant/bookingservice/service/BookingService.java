package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.cache.BookingQueryKey;
import com.restaurant.bookingservice.dto.booking.BookingBulkResponse;
import com.restaurant.bookingservice.dto.booking.BookingResponse;
import com.restaurant.bookingservice.dto.booking.CompleteBookingRequest;
import com.restaurant.bookingservice.enums.BookingStatus;
import com.restaurant.bookingservice.mapper.BookingMapper;
import com.restaurant.bookingservice.model.Booking;
import com.restaurant.bookingservice.model.Customer;
import com.restaurant.bookingservice.model.RestaurantTable;
import com.restaurant.bookingservice.repository.BookingRepository;
import com.restaurant.bookingservice.repository.CustomerRepository;
import com.restaurant.bookingservice.repository.TableRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private static final String BOOKING_NOT_FOUND_MESSAGE = "Бронирование с ID %d не найдено";
    private static final String TABLE_NOT_FOUND_MESSAGE = "Стол с ID %d не найден";
    private static final String TABLE_NOT_AVAILABLE_MESSAGE = "Стол %d занят на указанное время";
    private static final String FORBIDDEN_TABLE_MESSAGE =
            "Демонстрационная ошибка: стол с ID=999 запрещен";

    private static final String BULK_REQUEST_LOG = "Получено {} запросов на бронирование";
    private static final String BULK_RESULT_LOG = "Результат: успешно {} из {}, ошибок: {}";

    private final CustomerRepository customerRepository;
    private final TableRepository tableRepository;
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    private final Map<BookingQueryKey,
            List<BookingResponse>> queryCache = new ConcurrentHashMap<>();

    private RestaurantTable findTableById(Long tableId) {
        log.debug("Поиск стола по ID: {}", tableId);
        return tableRepository.findById(tableId)
                .orElseThrow(() -> {
                    log.error("Стол с ID {} не найден", tableId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            String.format(TABLE_NOT_FOUND_MESSAGE, tableId));
                });
    }

    private void checkTableAvailability(RestaurantTable table,
                                        LocalDateTime start, LocalDateTime end) {
        log.debug("Проверка доступности стола {} с {} по {}", table.getNumber(), start, end);
        List<Booking> existingBookings = bookingRepository.findByTableIdAndStartTimeBetween(
                table.getId(), start, end);

        if (!existingBookings.isEmpty()) {
            log.warn("Стол {} занят в указанное время. Найдено {} бронирований",
                    table.getNumber(), existingBookings.size());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format(TABLE_NOT_AVAILABLE_MESSAGE, table.getNumber()));
        }
        log.debug("Стол {} свободен", table.getNumber());
    }

    private Customer createAndSaveCustomer(CompleteBookingRequest request) {
        log.debug("Создание клиента: {}, телефон: {}",
                request.getCustomerName(), request.getCustomerPhone());
        Customer customer = Customer.builder()
                .name(request.getCustomerName())
                .phone(request.getCustomerPhone())
                .email(request.getCustomerEmail())
                .build();
        Customer savedCustomer = customerRepository.save(customer);
        log.info("Клиент сохранен с ID: {}", savedCustomer.getId());
        return savedCustomer;
    }

    private Booking createAndSaveBooking(CompleteBookingRequest request,
                                         Customer customer, RestaurantTable table) {
        log.debug("Создание бронирования для клиента ID: {}, стол ID: {}",
                customer.getId(), table.getId());
        Booking booking = Booking.builder()
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .numberOfGuests(request.getNumberOfGuests())
                .status(BookingStatus.CONFIRMED)
                .customer(customer)
                .table(table)
                .build();
        Booking savedBooking = bookingRepository.save(booking);
        log.info("Бронирование создано с ID: {}", savedBooking.getId());
        return savedBooking;
    }

    private Booking processNormalBooking(CompleteBookingRequest request) {
        log.info("Обработка обычного бронирования для стола ID: {}", request.getTableId());
        RestaurantTable table = findTableById(request.getTableId());
        checkTableAvailability(table, request.getStartTime(), request.getEndTime());

        Customer customer = customerRepository.findByPhone(request.getCustomerPhone())
                .orElseGet(() -> createAndSaveCustomer(request));

        return createAndSaveBooking(request, customer, table);
    }

    private void processBookingWithValidation(CompleteBookingRequest request,
                                              boolean isTransactional, String logPrefix) {
        log.info("{} - START для стола ID: {}", logPrefix, request.getTableId());

        if (request.getTableId() == 999) {
            log.warn("{} - Обнаружен запрещенный стол ID=999", logPrefix);
            Customer customer = createAndSaveCustomer(request);
            log.info("{} - Клиент сохранен с ID: {}, но будет ошибка", logPrefix, customer.getId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format(FORBIDDEN_TABLE_MESSAGE));
        }

        RestaurantTable table = findTableById(request.getTableId());
        checkTableAvailability(table, request.getStartTime(), request.getEndTime());
        Customer customer = createAndSaveCustomer(request);
        Booking booking = createAndSaveBooking(request, customer, table);

        String status = isTransactional ? "committed" : "success";
        log.info("{} - END ({}). Бронирование ID: {}", logPrefix, status, booking.getId());
    }

    private void invalidateCache() {
        int cacheSize = queryCache.size();
        queryCache.clear();
        log.info("ИНВАЛИДАЦИЯ КЭША ");
        log.info("Кэш очищен. Удалено {} записей", cacheSize);
    }

    public Booking getBookingById(Long id) {
        log.debug("Поиск бронирования по ID: {}", id);
        return bookingRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Бронирование с ID {} не найдено", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            String.format(BOOKING_NOT_FOUND_MESSAGE, id));
                });
    }

    public List<Booking> getAllBookings() {
        log.debug("Получение всех бронирований");
        List<Booking> bookings = bookingRepository.findAll();
        log.debug("Найдено бронирований {}", bookings.size());
        return bookings;
    }

    @Transactional
    public Booking createBooking(CompleteBookingRequest request) {
        log.info("СОЗДАНИЕ НОВОГО БРОНИРОВАНИЯ");
        Booking booking = processNormalBooking(request);
        invalidateCache();
        return booking;
    }

    @Transactional
    public Booking updateBooking(Long id, CompleteBookingRequest request) {
        log.info("ОБНОВЛЕНИЕ БРОНИРОВАНИЯ ID: {}", id);
        invalidateCache();

        Booking existingBooking = getBookingById(id);
        RestaurantTable table = findTableById(request.getTableId());

        if (!existingBooking.getTable().getId().equals(request.getTableId())) {
            checkTableAvailability(table, request.getStartTime(), request.getEndTime());
        }

        existingBooking.setStartTime(request.getStartTime());
        existingBooking.setEndTime(request.getEndTime());
        existingBooking.setNumberOfGuests(request.getNumberOfGuests());
        existingBooking.setTable(table);

        Booking updatedBooking = bookingRepository.save(existingBooking);
        log.info("Бронирование ID {} обновлено", id);
        return updatedBooking;
    }

    @Transactional
    public void deleteBooking(Long id) {
        log.info("УДАЛЕНИЕ БРОНИРОВАНИЯ ID: {}", id);
        invalidateCache();

        if (!bookingRepository.existsById(id)) {
            log.error("Бронирование с ID {} не найдено для удаления", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    String.format(BOOKING_NOT_FOUND_MESSAGE, id));
        }
        bookingRepository.deleteById(id);
        log.info("Бронирование с ID {} удалено", id);
    }

    @Transactional
    public void createBookingWithTransaction(CompleteBookingRequest request) {
        processBookingWithValidation(request, true, "TX DEMO");
    }

    public void createBookingWithoutTransaction(CompleteBookingRequest request) {
        processBookingWithValidation(request, false, "NO-TX DEMO");
    }

    public List<BookingResponse> findBookingsByComplexCriteria(
            String customerName,
            Integer minCapacity,
            BookingStatus status,
            LocalDateTime startDate) {

        log.info("СЛОЖНЫЙ JPQL ЗАПРОС");
        log.info("Параметры запроса:  customerName={}, minCapacity={}, status={}, startDate={}",
                customerName, minCapacity, status, startDate);

        BookingQueryKey key = new BookingQueryKey(customerName, minCapacity, status, startDate);

        List<BookingResponse> cachedResult = queryCache.get(key);
        if (cachedResult != null) {
            log.info("ДАННЫЕ ИЗ КЭША");
            log.info("Ключ кэша: {}", key);
            log.info("Данные получены из кэша для ключа: {}", key);
            return cachedResult;
        }

        log.info("Данных нет в кэше. Выполняется JPQL запрос в БД");

        List<Booking> bookings = bookingRepository.findBookingsByComplexCriteriaJpql(
                customerName, minCapacity, status, startDate);

        log.info("JPQL запрос выполнен. Найдено {} бронирований", bookings.size());

        List<BookingResponse> result = bookings.stream()
                .map(bookingMapper::toResponse)
                .toList();

        log.info("СОХРАНЕНИЕ В КЭШ");
        log.info("Сохранение результата в кэш по ключу: {}", key);
        queryCache.put(key, result);
        log.info("Размер кэша после сохранения: {}", queryCache.size());

        return result;
    }

    public List<BookingResponse> findBookingsByComplexCriteriaNative(
            String customerName,
            Integer minCapacity,
            BookingStatus status,
            LocalDateTime startDate) {

        log.info("NATIVE SQL ЗАПРОС");
        log.info("Параметры запроса: customerName={}, minCapacity={}, status={}, startDate={}",
                customerName, minCapacity, status, startDate);

        List<Booking> bookings = bookingRepository.findBookingsByComplexCriteriaNative(
                customerName, minCapacity, status.toString(), startDate);

        log.info("Native SQL запрос выполнен. Найдено {} бронирований", bookings.size());

        return bookings.stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    public Page<BookingResponse> findBookingsWithPagination(
            String customerName,
            Integer minCapacity,
            BookingStatus status,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        log.info("ПАГИНАЦИЯ");
        log.info("Параметры: customerName={}, minCapacity={}, status={}",
                customerName, minCapacity, status);
        log.info("Пагинация: page={}, size={}, sortBy={}, sortDirection={}",
                page, size, sortBy, sortDirection);

        Sort sort = sortDirection.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        log.debug("Создан Pageable объект: {}", pageable);

        Page<Booking> bookingPage = bookingRepository.findBookingsWithPagination(
                customerName, minCapacity, status, pageable);

        log.info("Запрос выполнен. Всего записей: {}, всего страниц: {},"
                        + " текущая страница: {}, элементов на странице: {}",
                bookingPage.getTotalElements(),
                bookingPage.getTotalPages(),
                bookingPage.getNumber(),
                bookingPage.getNumberOfElements());

        return bookingPage.map(bookingMapper::toResponse);
    }

    public int getCacheSize() {
        int size = queryCache.size();
        log.debug("Текущий размер кэша: {}", size);
        return size;
    }

    public void clearCache() {
        queryCache.clear();
        log.info("Кэш очищен вручную");
    }

    public void demonstrateNplus1Problem() {
        log.info("N+1 ПРОБЛЕМА");

        List<Booking> bookings = bookingRepository.findAll();
        log.info("1. Первый запрос: SELECT * FROM bookings (найдено {} записей)", bookings.size());

        int queryCount = 1;
        for (Booking booking : bookings) {
            log.info("   Доп. запрос {}: SELECT * FROM customers WHERE id = {}",
                    ++queryCount, booking.getCustomer().getId());
            log.info("   Доп. запрос {}: SELECT * FROM tables WHERE id = {}",
                    ++queryCount, booking.getTable().getId());
        }

        log.info("ИТОГО: выполнено {} SQL запросов (1 + {}*2 доп. запросов)",
                queryCount, bookings.size());
    }

    public void demonstrateNplus1Solution() {
        log.info("РЕШЕНИЕ ЧЕРЕЗ ENTITY GRAPH");

        List<Booking> bookings = bookingRepository.findAllWithDetails();
        log.info("1. Один запрос с JOIN: SELECT b.*, c.*, t.* FROM bookings b "
                + "LEFT JOIN customers c ON b.customer_id = c.id "
                + "LEFT JOIN tables t ON b.table_id = t.id");
        log.info("Найдено {} бронирований", bookings.size());
        log.info("ИТОГО: выполнен 1 SQL запрос");
    }

    public List<BookingResponse> findAllWithEntityGraph() {
        log.debug("Получение всех бронирований с EntityGraph");
        List<BookingResponse> result = bookingRepository.findAllWithDetails()
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
        log.debug("Найдено {} бронирований", result.size());
        return result;
    }

    public BookingBulkResponse createBookingsWithoutTransaction(
            List<CompleteBookingRequest> requests) {
        log.info("BULK CREATE БЕЗ ТРАНЗАКЦИИ");

        List<BookingResponse> createdBookings = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (CompleteBookingRequest request : requests) {
            try {
                if (request.getTableId() == 999) {
                    Customer savedCustomer = createAndSaveCustomer(request);
                    errors.add(String.format(
                            "Запрос %s: Клиент с ID %d сохранен, "
                                    + "но бронирование НЕ создано (запрещенный стол)",
                            request.getCustomerName(), savedCustomer.getId()));
                    continue;
                }
                Booking booking = processNormalBooking(request);
                createdBookings.add(bookingMapper.toResponse(booking));
            } catch (ResponseStatusException e) {
                errors.add(String.format("Запрос %s: %s",
                        request.getCustomerName(), e.getReason()));
                log.warn("Ошибка при создании бронирования: {}", e.getReason());
            }
        }

        log.info(BULK_RESULT_LOG, createdBookings.size(), requests.size(), errors.size());
        log.info("Без транзакции: создано {} бронирований, "
                        + "{} ошибок, клиенты для ошибочных запросов СОХРАНЕНЫ",
                createdBookings.size(), errors.size());

        return new BookingBulkResponse(requests.size(), createdBookings.size(), errors.size(),
                createdBookings, errors);
    }

    @Transactional
    public BookingBulkResponse createBookingsWithTransaction(
            List<CompleteBookingRequest> requests) {
        log.info("BULK CREATE С ТРАНЗАКЦИЕЙ");

        List<BookingResponse> createdBookings = new ArrayList<>();

        for (CompleteBookingRequest request : requests) {
            if (request.getTableId() == 999) {
                createAndSaveCustomer(request);
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        FORBIDDEN_TABLE_MESSAGE
                );
            }
            Booking booking = processNormalBooking(request);
            createdBookings.add(bookingMapper.toResponse(booking));
        }

        return new BookingBulkResponse(requests.size(), createdBookings.size(), 0, createdBookings,
                new ArrayList<>());
    }

    @Transactional
    public BookingBulkResponse createBookingsWithStream(List<CompleteBookingRequest> requests) {
        log.info("BULK CREATE С STREAM API");
        log.info(BULK_REQUEST_LOG, requests.size());

        List<Booking> bookings = requests.stream()
                .map(this::processNormalBooking)
                .toList();

        List<BookingResponse> createdBookings = bookings.stream()
                .map(bookingMapper::toResponse)
                .toList();

        return new BookingBulkResponse(requests.size(), createdBookings.size(), 0, createdBookings,
                new ArrayList<>());
    }

    public List<BookingResponse> getBookingsByIds(List<Long> ids) {
        log.info("BULK GET BOOKINGS");
        log.info("Запрошены бронирования с ID: {}", ids);

        List<BookingResponse> result = ids.stream()
                .map(bookingRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(bookingMapper::toResponse)
                .toList();

        log.info("Найдено {} из {} бронирований", result.size(), ids.size());
        return result;
    }

}