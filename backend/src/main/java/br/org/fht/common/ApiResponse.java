package br.org.fht.common;

public record ApiResponse<T>(T data, String message, int status) {

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(data, message, 200);
    }

    public static <T> ApiResponse<T> created(T data, String message) {
        return new ApiResponse<>(data, message, 201);
    }

    public static ApiResponse<Void> error(String message, int status) {
        return new ApiResponse<>(null, message, status);
    }
}
