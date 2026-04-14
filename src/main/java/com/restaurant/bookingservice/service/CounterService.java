package com.restaurant.bookingservice.service;

import java.util.concurrent.atomic.AtomicLong;
import lombok.Getter;
import org.springframework.stereotype.Service;

@Service
public class CounterService {

    @Getter
    private long unsafeCounter = 0;

    private final AtomicLong atomicCounter = new AtomicLong(0);

    public void incrementUnsafe() {
        unsafeCounter++;
    }

    public void incrementAtomic() {
        atomicCounter.incrementAndGet();
    }

    public long getAtomicCounter() {
        return atomicCounter.get();
    }

    public void resetCounters() {
        unsafeCounter = 0;
        atomicCounter.set(0);
    }
}