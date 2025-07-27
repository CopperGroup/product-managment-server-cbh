// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

import { applyClerkMiddleware } from './middleware/authMiddleware';
import errorHandler from './middleware/errorHandler';
import AppError from './utils/appError';

// Import your route modules
import authRoutes from './routes/authRoutes';
import groupRoutes from './routes/groupRoutes';
import storyRoutes from './routes/storyRoutes';
import blogRoutes from './routes/blogRoutes';
import publicRoutes from './routes/publicRoutes';
import userRoutes from './routes/userRoutes'; // IMPORT NEW USER ROUTES
import mediaRoutes from './routes/mediaRoutes';

const app = express();
app.set('trust proxy', 1);
// 1. GLOBAL MIDDLEWARE
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(mongoSanitize());
app.use(hpp({
    whitelist: []
}));

app.use(applyClerkMiddleware);

// 2. ROUTES
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/stories', storyRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/users', userRoutes); // ADDED: Mount user routes
app.use('/api/v1/media', mediaRoutes);

// 3. HANDLE UNHANDLED ROUTES
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4. GLOBAL ERROR HANDLING MIDDLEWARE
app.use(errorHandler);

export default app;