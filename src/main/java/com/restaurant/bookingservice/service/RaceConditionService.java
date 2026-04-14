package com.restaurant.bookingservice.service;


import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RaceConditionService {

    private final CounterService counterService;

    public String demonstrateProblem() throws InterruptedException {
        return executeTest(false);
    }

    public String demonstrateSolution() throws InterruptedException {
        return executeTest(true);
    }

    private String executeTest(boolean useAtomic) throws InterruptedException {
        counterService.resetCounters();

        int threadCount = 1000;
        int incrementsPerThread = 10;
        int expectedTotal = threadCount * incrementsPerThread;
        String testType = useAtomic ? "РЕШЕНИЕ ЧЕРЕЗ ATOMIC" : "ДЕМОНСТРАЦИЯ RACE CONDITION";
        log.info("{}", testType);
        log.info("Потоков: {}, инкрементов: {}", threadCount, incrementsPerThread);

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                for (int j = 0; j < incrementsPerThread; j++) {
                    if (useAtomic) {
                        counterService.incrementAtomic();
                    } else {
                        counterService.incrementUnsafe();
                    }
                }
            });
        }

        executor.shutdown();

        boolean finished = executor.awaitTermination(1, TimeUnit.MINUTES);

        if (!finished) {
            executor.shutdownNow();
            return "ОШИБКА: Таймаут выполнения";
        }

        long result = useAtomic ? counterService.getAtomicCounter() :
                counterService.getUnsafeCounter();

        String prefix = useAtomic ? "РЕШЕНИЕ" : "ПРОБЛЕМА";

        log.info("{} результат: {} (ожидалось: {})", prefix, result, expectedTotal);

        return String.format("%s: результат=%d (ожидалось=%d, потеряно=%d)",
                prefix, result, expectedTotal, expectedTotal - result);
    }
}