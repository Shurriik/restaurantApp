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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final String ORDER_NOT_FOUND_MESSAGE = "Заказ с ID %d не найден";
    private static final String BOOKING_NOT_FOUND_MESSAGE = "Бронирование с ID %d не найдено";
    private static final String MENU_ITEM_NOT_FOUND_MESSAGE = "Блюдо с ID %d не найдено";

    private final OrderRepository orderRepository;
    private final BookingRepository bookingRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderMapper orderMapper;

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllWithItems().stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findByIdWithItems(id);
        if (order == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    String.format(ORDER_NOT_FOUND_MESSAGE, id));
        }
        return orderMapper.toResponse(order);
    }

    public List<OrderResponse> getOrdersByBookingId(Long bookingId) {
        return orderRepository.findByBookingId(bookingId).stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    private List<MenuItem> getMenuItems(List<OrderRequest.OrderItemRequest> items) {
        List<MenuItem> menuItems = new ArrayList<>();
        for (OrderRequest.OrderItemRequest itemRequest : items) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            String.format(
                                    MENU_ITEM_NOT_FOUND_MESSAGE, itemRequest.getMenuItemId())));
            menuItems.add(menuItem);
        }
        return menuItems;
    }

    private void addOrderItems(
            Order order, List<OrderRequest.OrderItemRequest> items, List<MenuItem> menuItems) {
        if (order.getOrderItems() == null) {
            order.setOrderItems(new ArrayList<>());
        }

        for (int i = 0; i < items.size(); i++) {
            OrderRequest.OrderItemRequest itemRequest = items.get(i);
            MenuItem menuItem = menuItems.get(i);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemRequest.getQuantity())
                    .build();

            orderItemRepository.save(orderItem);
            order.getOrderItems().add(orderItem);
        }
        order.setTotalAmount(order.calculateTotalAmount());
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(BOOKING_NOT_FOUND_MESSAGE, request.getBookingId())));

        List<MenuItem> menuItems = getMenuItems(request.getItems());

        Order order = Order.builder()
                .booking(booking)
                .orderTime(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .orderItems(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.save(order);
        addOrderItems(savedOrder, request.getItems(), menuItems);

        Order updatedOrder = orderRepository.save(savedOrder);
        return orderMapper.toResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse updateOrder(Long id, OrderRequest request) {
        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(ORDER_NOT_FOUND_MESSAGE, id)));

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            List<MenuItem> menuItems = getMenuItems(request.getItems());

            orderItemRepository.deleteAll(existingOrder.getOrderItems());
            existingOrder.getOrderItems().clear();
            addOrderItems(existingOrder, request.getItems(), menuItems);
        }

        Order updatedOrder = orderRepository.save(existingOrder);
        return orderMapper.toResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        String.format(ORDER_NOT_FOUND_MESSAGE, id)));

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);

        return orderMapper.toResponse(updatedOrder);
    }

    @Transactional
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    String.format(ORDER_NOT_FOUND_MESSAGE, id));
        }
        orderRepository.deleteById(id);
    }
}