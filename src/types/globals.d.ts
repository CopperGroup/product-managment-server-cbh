// src/types/globals.d.ts

/// <reference types="@clerk/express/env" />

// Extend the Express Request interface to include the custom 'user' property
// that we attach in our authMiddleware.ts
declare namespace Express {
    interface Request {
        // Custom 'user' property attached by our protect middleware
        user?: {
            id: string; // Clerk userId
            // Add other properties if you attach them, e.g.,
            // role?: string;\
            _id?: string; 
        };
    }
}