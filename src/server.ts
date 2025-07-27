// src/server.ts
import dotenv from 'dotenv';
import path from 'path';
import app from './app'; // Import the Express app
import connectDB from './config/db'; // Import the database connection function
import { validateEnv, getEnvVariable } from './config/env'; // Import environment variable utilities

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Validate required environment variables before starting the application
validateEnv();

// Handle Uncaught Exceptions (synchronous errors not caught by try/catch)
process.on('uncaughtException', (err: Error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1); // Exit with failure code
});

// Connect to MongoDB
connectDB();

// Get the port from environment variables or use a default
const PORT = getEnvVariable('PORT') || 3000;

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle Unhandled Promise Rejections (asynchronous errors not caught by .catch())
process.on('unhandledRejection', (err: Error) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    // Close server and exit process
    server.close(() => {
        process.exit(1); // Exit with failure code
    });
});

// Handle SIGTERM signal (e.g., from Heroku or Docker stop)
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated!');
    });
});