// src/middleware/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import { ZodObject, ZodError } from 'zod'; // Use AnyZodObject

export const validate = (schema: ZodObject) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                params: req.params,
                query: req.query,
            });
            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                // CHANGE: Access `error.issues` instead of `error.errors`
                const errorMessages = error.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                }));
                return next(new AppError('Validation failed', 400, errorMessages));
            }
            next(new AppError('Invalid data provided', 400));
        }
    };