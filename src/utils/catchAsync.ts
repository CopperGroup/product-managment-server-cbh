// src/utils/catchAsync.ts
import { Request, Response, NextFunction } from 'express';

// Define a type for an async Express route handler
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps an asynchronous Express route handler to catch any errors
 * and pass them to the next middleware (error handling middleware).
 * @param fn The asynchronous function (route handler) to wrap.
 * @returns A new function that executes the original handler and catches errors.
 */
const catchAsync = (fn: AsyncHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Execute the async function and catch any promise rejections
        // then pass them to the next middleware (which should be your error handler)
        fn(req, res, next).catch(next);
    };
};

export default catchAsync;