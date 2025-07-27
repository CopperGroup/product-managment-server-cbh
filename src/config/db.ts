// src/config/db.ts
import mongoose from 'mongoose';
import { getEnvVariable } from './env'; // Utility to get environment variables

const connectDB = async () => {
    try {
        const mongoUri = getEnvVariable('MONGODB_URI');

        await mongoose.connect(mongoUri);

        console.log('MongoDB connected successfully!');
    } catch (error: any) {
        console.error(`MongoDB connection failed: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;