// src/utils/validationSchemas.ts
import { z } from 'zod'; // Example using Zod, install with `npm install zod`

// Example Schema for Story Creation
export const createStorySchema = z.object({
    body: z.object({
        groupId: z.string().min(1, 'Group ID is required'),
        title: z.string().min(3, 'Title must be at least 3 characters long').max(100, 'Title cannot exceed 100 characters'),
        description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
        htmlContent: z.string().optional(),
        // mediaUrl will be handled by the file upload process, not directly from body
    }),
    // If you have URL parameters or query parameters, define them here
    // params: z.object({ /* ... */ }),
    // query: z.object({ /* ... */ }),
});

// Example Schema for Blog Creation
export const createBlogSchema = z.object({
    body: z.object({
        groupId: z.string().min(1, 'Group ID is required'),
        title: z.string().min(3, 'Title must be at least 3 characters long').max(100, 'Title cannot exceed 100 characters'),
        content: z.string().min(10, 'Content must be at least 10 characters long'),
        thumbNailText: z.string().min(10, 'Thumbnail text must be at least 10 characters long').max(200, 'Thumbnail text cannot exceed 200 characters'),
        // thumbNailImage will be handled by file upload
    }),
});

// Example Schema for Group Creation
export const createGroupSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'Group name must be at least 3 characters long').max(50, 'Group name cannot exceed 50 characters'),
    }),
});

// Example Schema for ID parameters
export const idParamSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'), // MongoDB ObjectId format
    }),
});