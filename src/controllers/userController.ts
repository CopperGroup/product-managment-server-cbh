// src/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { clerkClient } from '../config/clerk'; // To interact with Clerk API if needed

/**
 * Get the currently authenticated user's profile from your database.
 * This endpoint is typically called by the frontend to get user-specific data.
 * Requires authentication (`protect` middleware).
 */
export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id; // MongoDB User _id from protect middleware

    if (!userId) {
        return next(new AppError('User ID not found in request context.', 401));
    }

    const user: IUser | null = await User.findById(userId)
        .populate('stories')
        .populate('blogs')
        .populate('groups');

    if (!user) {
        return next(new AppError('User profile not found in database.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

/**
 * Update the current user's profile.
 * Only allows updating fields that the user is permitted to change (e.g., not approvedStatus).
 * Requires authentication.
 */
export const updateMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id; // MongoDB User _id

    if (!userId) {
        return next(new AppError('User ID not found in request context.', 401));
    }

    // Filter out fields that should not be updated by the user
    const filteredBody: { [key: string]: any } = {};
    const allowedFields = ['firstName', 'lastName', 'username', 'email']; // Example fields
    Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
            filteredBody[key] = req.body[key];
        }
    });

    // If you need to update Clerk's user data (e.g., email, username), use clerkClient
    // await clerkClient.users.updateUser(req.user!.id, { email_addresses: [req.body.email] });

    const updatedUser: IUser | null = await User.findByIdAndUpdate(userId, filteredBody, {
        new: true,
        runValidators: true,
    });

    if (!updatedUser) {
        return next(new AppError('User not found for update.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

/**
 * Create a new user in your database based on Clerk's user ID.
 * This is typically called by a Clerk webhook (user.created event), not directly by frontend.
 * However, you might have an endpoint for initial user creation if webhooks are not used.
 * For this project, it's primarily handled by the authController webhook.
 */
export const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // This endpoint might be used for manual user creation or by a specific admin action
    // For automatic creation on Clerk signup, use the webhook in authController.ts
    const { clerkId } = req.body;

    if (!clerkId) {
        return next(new AppError('Clerk ID is required to create a user.', 400));
    }

    const existingUser = await User.findOne({ clerkId });
    if (existingUser) {
        return next(new AppError('User with this Clerk ID already exists.', 409));
    }

    const newUser = await User.create({ clerkId });

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser,
        },
    });
});

/**
 * Update a user by ID (e.g., by an admin to change approvedStatus).
 * Requires authentication and potentially role-based authorization (e.g., admin role).
 */
export const updateUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // MongoDB _id of the user to update
    const { approvedStatus, ...otherUpdates } = req.body; // Example: allow admin to update approvedStatus

    // Implement authorization check here (e.g., if (req.user?.role !== 'admin'))
    // For now, assuming protect middleware ensures authenticated request.

    const user: IUser | null = await User.findByIdAndUpdate(id, { approvedStatus, ...otherUpdates }, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        return next(new AppError('User not found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

/**
 * Delete a user by ID (e.g., by an admin).
 * Requires authentication and potentially role-based authorization.
 */
export const deleteUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // MongoDB _id of the user to delete

    // Implement authorization check here

    const user = await User.findById(id);

    if (!user) {
        return next(new AppError('User not found with that ID.', 404));
    }

    // Optionally, handle cascading deletes for stories, blogs, groups created by this user
    // await Story.deleteMany({ createdBy: user._id });
    // await Blog.deleteMany({ createdBy: user._id });
    // await Group.deleteMany({ createdBy: user._id });

    await user.deleteOne();

    res.status(204).json({
        status: 'success',
        data: null,
    });
});