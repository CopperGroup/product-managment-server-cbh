// src/routes/publicRoutes.ts
import { Router } from 'express';
import {
    fetchGroupStories, // Changed from fetchAllGroupsStories
    fetchGroupBlogs,   // Changed from fetchAllGroupsBlogs
    getAllPublicGroups // New import
} from '../controllers/publicController';

// Import necessary validation schemas if you have them (e.g., idParamSchema)
import { validate } from '../middleware/validationMiddleware'; // Assuming you have this
import { idParamSchema } from '../utils/validationSchemas'; // Assuming this schema exists for ID validation

const router = Router();

// These routes are intentionally NOT protected by any authentication middleware.

// New route to fetch all available (non-archived) groups
router.get('/groups', getAllPublicGroups); // New route

// Routes to fetch stories/blogs of individual groups
router.get('/groups/:id/stories', validate(idParamSchema), fetchGroupStories); // Dynamic route for stories
router.get('/groups/:id/blogs', validate(idParamSchema), fetchGroupBlogs);     // Dynamic route for blogs


export default router;