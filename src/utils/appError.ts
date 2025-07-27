// src/utils/appError.ts

/**
 * Custom error class for API-specific errors.
 * Extends the native Error object to include HTTP status code and status.
 */
class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    data?: any; // Optional field for additional error data (e.g., validation errors)

    /**
     * Creates an instance of AppError.
     * @param message A descriptive error message.
     * @param statusCode The HTTP status code for the error (e.g., 400, 401, 403, 404, 500).
     * @param data Optional additional data related to the error (e.g., validation errors array).
     */
    constructor(message: string, statusCode: number, data?: any) {
        super(message); // Call the parent Error constructor

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Indicates an error that we can handle gracefully
        this.data = data; // Store additional data

        // Capture the stack trace, excluding the constructor call from the stack
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            // Fallback for environments that don't support captureStackTrace
            this.stack = new Error(message).stack;
        }
    }
}

export default AppError;