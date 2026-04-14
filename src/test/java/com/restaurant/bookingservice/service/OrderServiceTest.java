package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.order.OrderRequest;
import com.restaurant.bookingservice.dto.order.OrderResponse;
import com.restaurant.bookingservice.enums.OrderStatus;
import com.restaurant.bookingservice.mapper.OrderMapper;
import com.restaurant.bookingservice.model.Booking;
import com.restaurant.bookingservice.model.MenuItem;
import com.restaurant.bookingservice.model.Order;
import com.restaurant.bookingservice.model.OrderItem;
import com.restaurant.bookingservice.repository.BookingRepository;
import com.restaurant.bookingservice.repository.MenuItemRepository;
import com.restaurant.bookingservice.repository.OrderItemRepository;
import com.restaurant.bookingservice.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.anyList;
import static org.mockito.Mockito.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService Unit Tests")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderService orderService;

    private Booking booking;
    private MenuItem menuItem;
    private Order order;
    private OrderRequest request;
    private OrderResponse response;

    @BeforeEach
    void setUp() {
        booking = Booking.builder()
                .id(1L)
                .build();

        menuItem = MenuItem.builder()
                .id(1L)
                .name("Draniki with sour cream")
                .price(new BigDecimal("12.50"))
                .build();

        order = Order.builder()
                .id(1L)
                .booking(booking)
                .orderTime(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .orderItems(new ArrayList<>())
                .build();

        OrderRequest.OrderItemRequest itemRequest = OrderRequest.OrderItemRequest.builder()
                .menuItemId(1L)
                .quantity(2)
                .build();

        request = OrderRequest.builder()
                .bookingId(1L)
                .items(List.of(itemRequest))
                .build();

        OrderResponse.OrderItemResponse itemResponse = OrderResponse.OrderItemResponse.builder()
                .id(1L)
                .menuItemName("Draniki with sour cream")
                .menuItemPrice(new BigDecimal("12.50"))
                .quantity(2)
                .totalPrice(new BigDecimal("25.00"))
                .build();

        response = OrderResponse.builder()
                .id(1L)
                .bookingId(1L)
                .orderTime(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .totalAmount(new BigDecimal("25.00"))
                .items(List.of(itemResponse))
                .build();
    }

    @Test
    @DisplayName("getAllOrders")
    void shouldReturnAllOrders() {
        when(orderRepository.findAllWithItems()).thenReturn(List.of(order));
        when(orderMapper.toResponse(order)).thenReturn(response);

        List<OrderResponse> result = orderService.getAllOrders();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getOrderById - найдено")
    void shouldReturnOrderWhenExists() {
        when(orderRepository.findByIdWithItems(1L)).thenReturn(order);
        when(orderMapper.toResponse(order)).thenReturn(response);

        OrderResponse result = orderService.getOrderById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getOrderById - не найдено")
    void shouldThrowExceptionWhenOrderNotFound() {
        when(orderRepository.findByIdWithItems(1L)).thenReturn(null);

        assertThatThrownBy(() -> orderService.getOrderById(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Заказ с ID 1 не найден");
    }

    @Test
    @DisplayName("getOrdersByBookingId")
    void shouldReturnOrdersByBookingId() {
        when(orderRepository.findByBookingId(1L)).thenReturn(List.of(order));
        when(orderMapper.toResponse(order)).thenReturn(response);

        List<OrderResponse> result = orderService.getOrdersByBookingId(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("createOrder - успешно")
    void shouldCreateOrderSuccessfully() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderItemRepository.save(any(OrderItem.class))).thenReturn(OrderItem.builder().id(1L).build());
        when(orderMapper.toResponse(any(Order.class))).thenReturn(response);

        OrderResponse result = orderService.createOrder(request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(orderRepository, times(2)).save(any(Order.class));
        verify(orderItemRepository, times(1)).save(any(OrderItem.class));
    }

    @Test
    @DisplayName("createOrder - бронирование не найдено")
    void shouldThrowExceptionWhenBookingNotFound() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Бронирование с ID 1 не найдено");
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("createOrder - блюдо не найдено")
    void shouldThrowExceptionWhenMenuItemNotFound() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Блюдо с ID 1 не найдено");
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("createOrder - orderItems изначально null")
    void shouldCreateOrderWhenOrderItemsIsNull() {
        Order orderWithNullItems = Order.builder()
                .id(1L)
                .booking(booking)
                .orderTime(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .orderItems(null)
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(orderRepository.save(any(Order.class))).thenReturn(orderWithNullItems)
                .thenReturn(order);
        when(orderItemRepository.save(any(OrderItem.class))).thenReturn(OrderItem.builder().id(1L).build());
        when(orderMapper.toResponse(any(Order.class))).thenReturn(response);

        OrderResponse result = orderService.createOrder(request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(orderRepository, times(2)).save(any(Order.class));
        verify(orderItemRepository, times(1)).save(any(OrderItem.class));
    }

    @Test
    @DisplayName("updateOrderStatus - успешно")
    void shouldUpdateOrderStatusSuccessfully() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderMapper.toResponse(order)).thenReturn(response);

        OrderResponse result = orderService.updateOrderStatus(1L, OrderStatus.READY);

        assertThat(result).isNotNull();
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("updateOrderStatus - не найдено")
    void shouldThrowExceptionWhenOrderNotFoundForStatusUpdate() {
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, OrderStatus.READY))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Заказ с ID 1 не найден");
    }

    @Test
    @DisplayName("deleteOrder - успешно")
    void shouldDeleteOrderSuccessfully() {
        when(orderRepository.existsById(1L)).thenReturn(true);
        doNothing().when(orderRepository).deleteById(1L);

        orderService.deleteOrder(1L);

        verify(orderRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("deleteOrder - не найдено")
    void shouldThrowExceptionWhenOrderNotFoundForDelete() {
        when(orderRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> orderService.deleteOrder(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Заказ с ID 1 не найден");
        verify(orderRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("updateOrder - успешно с обновлением items")
    void shouldUpdateOrderSuccessfully() {
        OrderRequest updateRequest = OrderRequest.builder()
                .bookingId(1L)
                .items(List.of(
                        OrderRequest.OrderItemRequest.builder()
                                .menuItemId(1L)
                                .quantity(3)
                                .build()
                ))
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(orderItemRepository.save(any(OrderItem.class))).thenReturn(OrderItem.builder().id(1L).build());
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderMapper.toResponse(any(Order.class))).thenReturn(response);

        OrderResponse result = orderService.updateOrder(1L, updateRequest);

        assertThat(result).isNotNull();
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(orderItemRepository, times(1)).deleteAll(anyList());
        verify(orderItemRepository, times(1)).save(any(OrderItem.class));
    }

    @Test
    @DisplayName("updateOrder - заказ не найден")
    void shouldThrowExceptionWhenOrderNotFoundForUpdate() {
        OrderRequest updateRequest = OrderRequest.builder()
                .bookingId(1L)
                .items(List.of(
                        OrderRequest.OrderItemRequest.builder()
                                .menuItemId(1L)
                                .quantity(3)
                                .build()
                ))
                .build();

        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.updateOrder(999L, updateRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Заказ с ID 999 не найден");

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("updateOrder - с пустым списком items (items = null)")
    void shouldUpdateOrderWithNullItems() {
        OrderRequest updateRequest = OrderRequest.builder()
                .bookingId(1L)
                .items(null)
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderMapper.toResponse(order)).thenReturn(response);

        OrderResponse result = orderService.updateOrder(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(orderItemRepository, never()).deleteAll(anyList());
        verify(orderItemRepository, never()).save(any(OrderItem.class));
    }

    @Test
    @DisplayName("updateOrder - с пустым списком items (items = empty list)")
    void shouldUpdateOrderWithEmptyItemsList() {
        OrderRequest updateRequest = OrderRequest.builder()
                .bookingId(1L)
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderMapper.toResponse(order)).thenReturn(response);

        OrderResponse result = orderService.updateOrder(1L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(orderItemRepository, never()).deleteAll(anyList());
        verify(orderItemRepository, never()).save(any(OrderItem.class));
    }
}