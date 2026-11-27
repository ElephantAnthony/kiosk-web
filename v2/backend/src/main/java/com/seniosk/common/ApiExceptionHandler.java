package com.seniosk.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    ProblemDetail invalidRequest(Exception ignored) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid request body");
    }
    @ExceptionHandler(ResponseStatusException.class)
    ProblemDetail status(ResponseStatusException ex) {
        return ProblemDetail.forStatusAndDetail(ex.getStatusCode(),
            ex.getStatusCode().value() == 404 ? "Requested resource not found" : "Request rejected");
    }
}
