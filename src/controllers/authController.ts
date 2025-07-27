// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { getEnvVariable } from '../config/env';

// You would typically use a library like `svix` for webhook verification
// import { Webhook } from 'svix';

// Get Clerk Webhook Secret from environment variables
const CLERK_WEBHOOK_SECRET = getEnvVariable('CLERK_WEBHOOK_SECRET');

/**
 * Handles Clerk webhook events to synchronize user data with the local MongoDB.
 * This endpoint should be configured in your Clerk Dashboard as a webhook URL.
 * It expects a POST request with the Clerk event payload.
 */
export const handleClerkWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const headers = req.headers;

    // --- Webhook Verification (Highly Recommended in Production) ---
    // In a real application, you would verify the webhook signature
    // to ensure it's coming from Clerk and hasn't been tampered with.
    // Example with Svix:
    /*
    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return next(new AppError('Missing Svix headers', 400));
    }

    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    let evt: any;

    try {
        evt = wh.verify(JSON.stringify(payload), {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    } catch (err: any) {
        console.error('Clerk Webhook verification failed:', err.message);
        return next(new AppError('Webhook signature verification failed', 400));
    }
    */
    // For development, you might skip verification, but NEVER in production.
    // For now, we'll assume verification passes or is handled externally.

    const eventType = payload.type;
    const clerkUserData = payload.data; // Data related to the user event

    console.log(`Received Clerk Webhook event: ${eventType} for user ${clerkUserData.id}`);

    switch (eventType) {
        case 'user.created':
            // Create a new user in your MongoDB
            await User.create({
                clerkId: clerkUserData.id,
                // You can populate other fields from clerkUserData if needed, e.g.,
                // email: clerkUserData.email_addresses[0]?.email_address,
                // username: clerkUserData.username,
            });
            console.log(`User ${clerkUserData.id} created in DB.`);
            break;

        case 'user.updated':
            // Update an existing user in your MongoDB
            // Note: approvedStatus is managed by your app, not Clerk webhook directly
            await User.findOneAndUpdate(
                { clerkId: clerkUserData.id },
                {
                    // Update fields from Clerk payload if necessary
                    // email: clerkUserData.email_addresses[0]?.email_address,
                    // username: clerkUserData.username,
                },
                { new: true, runValidators: true }
            );
            console.log(`User ${clerkUserData.id} updated in DB.`);
            break;

        case 'user.deleted':
            // Delete the user from your MongoDB
            // Consider soft-deleting or handling associated data (stories, blogs, groups)
            await User.findOneAndDelete({ clerkId: clerkUserData.id });
            console.log(`User ${clerkUserData.id} deleted from DB.`);
            break;

        default:
            console.warn(`Unhandled Clerk Webhook event type: ${eventType}`);
            break;
    }

    res.status(200).json({
        status: 'success',
        message: 'Webhook received and processed',
    });
});