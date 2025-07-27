// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth } from '@clerk/express';
import AppError from '../utils/appError';
import User, { IUser } from '../models/User'; // Import User model AND IUser interface

// No need for a local declare global block here, as it's handled by src/types/globals.d.ts

// 1. Apply clerkMiddleware to all routes that need auth context
export const applyClerkMiddleware = clerkMiddleware();

/**
 * Middleware to protect routes, ensuring the user is authenticated via Clerk.
 * Attaches the Clerk userId to req.user.id and the MongoDB User _id to req.user._id.
 * This should be used AFTER applyClerkMiddleware().
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    // getAuth() retrieves the authentication state from the request
    // req.auth should be correctly typed here due to src/types/globals.d.ts
    const { userId } = getAuth(req); // getAuth() directly gives you the userId, etc.

    if (!userId) {
        // If no userId is found, the user is not authenticated
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Explicitly type currentUser as IUser | null
    const currentUser: IUser | null = await User.findOne({ clerkId: userId });

    if (!currentUser) {
        return next(new AppError('User profile not found in database. Please ensure your account is registered.', 401));
    }

    // Ensure _id exists and is converted to string
    if (!currentUser._id) {
        return next(new AppError('User document found but is missing _id.', 500));
    }

    req.user = {
        id: userId, // Clerk user ID (e.g., user_xxxxxx)
        _id: currentUser._id.toString() // MongoDB User document ID
    };

    next();
};

/**
 * Middleware to restrict access to routes based on the user's approvedStatus.
 * Requires `protect` middleware to have run first.
 */
export const restrictToApproved = async (req: Request, res: Response, next: NextFunction) => {
    const clerkId = req.user?.id;

    if (!clerkId) {
        return next(new AppError('Authentication context missing. Ensure `protect` middleware runs first.', 500));
    }

    const user: IUser | null = await User.findOne({ clerkId });

    if (!user) {
        return next(new AppError('User profile not found for approval check.', 404));
    }

    if (!user.approvedStatus) {
        return next(new AppError('Your account is not approved. Please contact an administrator for access.', 403));
    }

    next();
};