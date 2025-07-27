// src/routes/storyRoutes.ts
import { Router } from 'express';
import { createStory, getAllStories, getStory, updateStory, deleteStory } from '../controllers/storyController';
import { protect, restrictToApproved } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { createStorySchema, idParamSchema } from '../utils/validationSchemas';
import upload from '../utils/multerConfig'; // Import multer configuration

const router = Router();

// Apply authentication middleware to all story routes
router.use(protect); // Ensure user is authenticated

router.route('/')
    .post(
        restrictToApproved, // Only approved users can create stories
        upload.single('media'), // Multer middleware for single file upload (field name 'media')
        validate(createStorySchema), // Validate body after file parsing
        createStory
    )
    .get(getAllStories); // Authenticated users can get all stories

router.route('/:id')
    .get(validate(idParamSchema), getStory)
    .patch(
        restrictToApproved, // Approved users can update
        upload.single('media'), // Multer for optional media update
        validate(idParamSchema), // Validate ID
        // Note: Body validation for PATCH should be more flexible,
        // you might need a separate partial schema for updates or handle it in controller
        updateStory
    )
    .delete(restrictToApproved, validate(idParamSchema), deleteStory); // Approved users can delete

export default router;