// src/routes/uploadRoutes.ts
import { Router } from 'express';
import { protect, restrictToApproved } from '../middleware/authMiddleware';
import upload from '../utils/multerConfig'; // Import your multer configuration
import { uploadSingleMedia } from '../controllers/mediaController'; // Import the new controller

const router = Router();

// All upload routes require authentication
router.use(protect);

// Route for single media file upload
router.post(
    '/',
    restrictToApproved, // Only approved users can upload
    upload.single('media'), // Multer middleware to handle the 'media' field from formData
    uploadSingleMedia
);

// You can add more specific upload routes here (e.g., /upload/profile-pic, /upload/gallery-image)

export default router;