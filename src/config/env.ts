// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
// This should be called early in your application's lifecycle (e.g., in server.ts)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Safely retrieves an environment variable. Throws an error if the variable is not set.
 * @param key The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws {Error} If the environment variable is not set.
 */
export const getEnvVariable = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set.`);
    }
    return value;
};

// You can add validation for all required env vars here if desired
export const validateEnv = () => {
    try {
        getEnvVariable('MONGODB_URI');
        getEnvVariable('CLERK_SECRET_KEY');
        getEnvVariable('CLOUDFLARE_ACCOUNT_ID');
        getEnvVariable('CLOUDFLARE_R2_ACCESS_KEY_ID');
        getEnvVariable('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
        getEnvVariable('CLOUDFLARE_R2_BUCKET_NAME');
        getEnvVariable('MEDIA_URL')
        // CLOUDFLARE_R2_ENDPOINT is optional as it can be derived by fast-r2
        console.log('All required environment variables are set.');
    } catch (error: any) {
        console.error(`Environment variable validation failed: ${error.message}`);
        process.exit(1); // Exit if critical env vars are missing
    }
};