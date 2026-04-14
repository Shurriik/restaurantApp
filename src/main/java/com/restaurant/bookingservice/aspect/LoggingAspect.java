package com.restaurant.bookingservice.aspect;

import java.util.Arrays;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class LoggingAspect {

    @Pointcut("within(@org.springframework.stereotype.Service *)")
    public void serviceMethods() {
    }

    @Around("serviceMethods()")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        log.info("Вход в метод {}.{}() с аргументами: {}",
                className, methodName, args.length > 0 ? Arrays.toString(args) : "нет аргументов");

        try {
            Object result = joinPoint.proceed();

            long elapsedTime = System.currentTimeMillis() - start;

            log.info("Выход из метода {}.{}() - время выполнения: {} мс, результат: {}",
                    className, methodName, elapsedTime,
                    result != null ? "успешно" : "null");

            return result;
        } catch (Exception e) {
            long elapsedTime = System.currentTimeMillis() - start;
            log.error("Исключение в методе {}.{}() - время выполнения: {} мс, ошибка: {}",
                    className, methodName, elapsedTime, e.getMessage());
            throw e;
        }
    }
}