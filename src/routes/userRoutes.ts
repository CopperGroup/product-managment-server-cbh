// src/routes/userRoutes.ts
import { Router } from 'express';
import { getMe, updateMe, createUser, updateUserById, deleteUserById } from '../controllers/userController';
import { protect, restrictToApproved } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { idParamSchema } from '../utils/validationSchemas'; // For validating ID params

const router = Router();

// Apply authentication middleware to all user routes
router.use(protect);

// Route for the currently authenticated user's profile
router.get('/me', getMe);
router.patch('/updateMe', updateMe); // Example: User can update their own non-sensitive profile info

// Admin-only routes (requires additional authorization middleware if roles are implemented)
// For now, restrictToApproved is used as a placeholder for elevated access
router.route('/')
    .post(restrictToApproved, createUser); // Example: Admin creates a user (if not using webhooks)

router.route('/:id')
    .patch(restrictToApproved, validate(idParamSchema), updateUserById) // Admin updates any user
    .delete(restrictToApproved, validate(idParamSchema), deleteUserById); // Admin deletes any user

export default router;