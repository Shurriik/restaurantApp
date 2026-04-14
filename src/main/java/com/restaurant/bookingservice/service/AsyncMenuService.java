package com.restaurant.bookingservice.service;

import com.restaurant.bookingservice.dto.async.AsyncTaskResponse;
import com.restaurant.bookingservice.dto.menu.MenuItemRequest;
import com.restaurant.bookingservice.dto.menu.MenuItemResponse;
import com.restaurant.bookingservice.model.MenuItem;
import com.restaurant.bookingservice.model.Tag;
import com.restaurant.bookingservice.repository.MenuItemRepository;
import com.restaurant.bookingservice.repository.TagRepository;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncMenuService {

    private final MenuItemRepository menuItemRepository;
    private final TagRepository tagRepository;
    private final ApplicationContext applicationContext;

    private final Map<String, AsyncTaskResponse> taskStore = new ConcurrentHashMap<>();

    public String createMenuItemAsync(MenuItemRequest request) {
        String taskId = UUID.randomUUID().toString();

        AsyncTaskResponse response = AsyncTaskResponse.builder()
                .taskId(taskId)
                .status("IN_PROGRESS")
                .createdAt(LocalDateTime.now())
                .build();
        taskStore.put(taskId, response);

        AsyncMenuService proxy = applicationContext.getBean(AsyncMenuService.class);
        proxy.executeAsync(taskId, request);

        return taskId;
    }

    @Async("taskExecutor")
    @Transactional
    public void executeAsync(String taskId, MenuItemRequest request) {
        log.info("Асинхронная задача {} начата для блюда: {}", taskId, request.getName());

        try {
            simulateDelay(taskId);

            MenuItem menuItem = MenuItem.builder()
                    .name(request.getName())
                    .price(request.getPrice())
                    .build();

            if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
                for (Long tagId : request.getTagIds()) {
                    Tag tag = tagRepository.findById(tagId)
                            .orElseThrow(() -> new RuntimeException(
                                    "Тег с ID " + tagId + " не найден"));
                    menuItem.addTag(tag);
                }
            }

            MenuItem savedMenuItem = menuItemRepository.save(menuItem);

            MenuItemResponse result = MenuItemResponse.builder()
                    .id(savedMenuItem.getId())
                    .name(savedMenuItem.getName())
                    .price(savedMenuItem.getPrice())
                    .build();

            AsyncTaskResponse response = taskStore.get(taskId);
            response.setStatus("COMPLETED");
            response.setCompletedAt(LocalDateTime.now());
            response.setResult(result);
            response.setMessage("Блюдо успешно создано с ID: " + savedMenuItem.getId());

            log.info("Асинхронная задача {} завершена успешно. ID созданного блюда: {}",
                    taskId, savedMenuItem.getId());

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Асинхронная задача {} была прервана: {}", taskId, e.getMessage());

            AsyncTaskResponse response = taskStore.get(taskId);
            response.setStatus("FAILED");
            response.setCompletedAt(LocalDateTime.now());
            response.setError("Task was interrupted: " + e.getMessage());
            response.setMessage("Задача была прервана");

        } catch (Exception e) {
            log.error("Ошибка в асинхронной задаче {}: {}", taskId, e.getMessage());
            AsyncTaskResponse response = taskStore.get(taskId);
            response.setStatus("FAILED");
            response.setCompletedAt(LocalDateTime.now());
            response.setError(e.getMessage());
            response.setMessage("Ошибка при создании блюда: " + e.getMessage());
        }
    }


    private void simulateDelay(String taskId) throws InterruptedException {
        try {
            Thread.sleep(7000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Задержка задачи {} была прервана", taskId);
            throw e;
        }
    }

    public AsyncTaskResponse getTaskStatus(String taskId) {
        return taskStore.get(taskId);
    }

    public Map<String, AsyncTaskResponse> getAllTasks() {
        return taskStore;
    }
}