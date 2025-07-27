// src/routes/groupRoutes.ts
import { Router } from 'express';
import { createGroup, getAllGroups, getGroup, updateGroup, deleteGroup, archiveGroup } from '../controllers/groupController';
import { protect, restrictToApproved } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { createGroupSchema, idParamSchema } from '../utils/validationSchemas';
import upload from '../utils/multerConfig'; // Import multer configuration

const router = Router();

// Apply authentication middleware to all group routes
router.use(protect); // Ensure user is authenticated

router.route('/')
    .post(
        restrictToApproved, // Only approved users can create groups
        upload.single('avatarUrl'), // Multer middleware for single file upload (field name 'avatar')
        validate(createGroupSchema), // Validate body after file parsing
        createGroup
    )
    .get(getAllGroups); // Authenticated users can get all groups

router.route('/:id')
    .get(validate(idParamSchema), getGroup)
    .patch(
        restrictToApproved, // Approved users can update
        upload.single('avatarUrl'), // Multer for optional avatar update
        validate(idParamSchema), // Validate ID
        updateGroup
    )
    .delete(restrictToApproved, validate(idParamSchema), deleteGroup); // Approved users can delete

router.route('/archive/:id')
    .patch(restrictToApproved, validate(idParamSchema), archiveGroup); // Approved users can update, controller handles creator check

export default router;