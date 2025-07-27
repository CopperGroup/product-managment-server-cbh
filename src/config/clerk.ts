// src/config/clerk.ts
import dotenv from 'dotenv';
import { clerkClient } from '@clerk/express';

dotenv.config(); // Ensure environment variables are loaded

// Clerk's @clerk/express SDK automatically picks up CLERK_SECRET_KEY from process.env
// The clerkClient object is then available for interacting with Clerk's Backend API.
// No explicit initialization call is usually needed here, just importing it makes it ready.

export { clerkClient };