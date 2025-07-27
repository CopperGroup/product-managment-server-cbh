// src/routes/blogRoutes.ts
import { Router } from 'express';
import { createBlog, getAllBlogs, getBlog, updateBlog, deleteBlog } from '../controllers/blogController';
import { protect, restrictToApproved } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { createBlogSchema, idParamSchema } from '../utils/validationSchemas';
import upload from '../utils/multerConfig'; // Import multer configuration

const router = Router();

// Apply authentication middleware to all blog routes
router.use(protect); // Ensure user is authenticated

router.route('/')
    .post(
        restrictToApproved, // Only approved users can create blogs
        upload.single('thumbNailImage'), // Multer for thumbnail upload (field name 'thumbNailImage')
        validate(createBlogSchema), // Validate body after file parsing
        createBlog
    )
    .get(getAllBlogs); // Authenticated users can get all blogs

router.route('/:id')
    .get(validate(idParamSchema), getBlog)
    .patch(
        restrictToApproved, // Approved users can update
        upload.single('thumbNailImage'), // Multer for optional thumbnail update
        validate(idParamSchema), // Validate ID
        // Note: Similar to stories, body validation for PATCH might need a partial schema
        updateBlog
    )
    .delete(restrictToApproved, validate(idParamSchema), deleteBlog); // Approved users can delete

export default router;