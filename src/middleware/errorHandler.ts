// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    // Set default status code and message
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error in development for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('ERROR 💥', err);
    }

    // Send error response
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        // Optionally include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;