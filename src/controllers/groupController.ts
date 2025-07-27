// src/controllers/groupController.ts
import { Request, Response, NextFunction } from 'express';
import Group, { IGroup } from '../models/Group'; // Import IGroup interface
import User from '../models/User';
import Story from '../models/Story';
import Blog from '../models/Blog';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { uploadMedia, deleteMedia } from '../services/r2Service'; // Import R2 services
import { getEnvVariable } from '../config/env';

const MEDIA_URL = getEnvVariable('MEDIA_URL');
const BUCKET_NAME = getEnvVariable('CLOUDFLARE_R2_BUCKET_NAME');

/**
 * Create a new Group.
 * Requires authentication.
 */
export const createGroup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
    const createdBy = req.user?._id; // MongoDB User _id from protect middleware
    const file = (req as any).file; // The uploaded avatar file

    if (!createdBy) {
        return next(new AppError('Creator ID not found. Authentication required.', 401));
    }

    let avatarUrl = '';
    if (file) {
        const fileExtension = file.originalname.split('.').pop();
        const fileNameInR2 = `groups/${createdBy}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const uploadResult = await uploadMedia(file.buffer, fileNameInR2, file.mimetype);
        avatarUrl = MEDIA_URL + uploadResult.Location.split(".com/")[1].replace(BUCKET_NAME, "");
    }

    const newGroup = await Group.create({
        name,
        createdBy,
        avatarUrl, // Assign the uploaded avatar URL
    });

    // Add the new group's ID to the creator's user document
    await User.findByIdAndUpdate(createdBy, {
        $push: { groups: newGroup._id }
    }, { new: true });

    res.status(201).json({
        status: 'success',
        data: {
            group: newGroup,
        },
    });
});

/**
 * Get all Groups.
 * Requires authentication.
 */
export const getAllGroups = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const groups = await Group.find({}); // Fetch all groups
    res.status(200).json({
        status: 'success',
        results: groups.length,
        data: {
            groups,
        },
    });
});

/**
 * Get a single Group by ID.
 * Requires authentication. Populates stories and blogs.
 */
export const getGroup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const group = await Group.findById(req.params.id)
        .populate('stories') // Populate stories
        .populate('blogs')   // Populate blogs
        .populate('createdBy', 'clerkId approvedStatus'); // Populate creator info

    if (!group) {
        return next(new AppError('No group found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            group,
        },
    });
});

/**
 * Update a Group by ID.
 * Requires authentication. Only the creator or admin can update.
 */
export const updateGroup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
    const userId = req.user?._id; // MongoDB User _id
    const file = (req as any).file; // The uploaded avatar file

    const group: IGroup | null = await Group.findById(req.params.id);

    if (!group) {
        return next(new AppError('No group found with that ID', 404));
    }

    if (!group.createdBy || group.createdBy.toString() !== userId) {
        return next(new AppError('You do not have permission to update this group.', 403));
    }

    let newAvatarUrl = group.avatarUrl;
    if (file) {
        // Delete old avatar from R2 if it exists
        if (group.avatarUrl) {
            const oldFileNameInR2 = group.avatarUrl.replace(`${MEDIA_URL}/`, '');
            if (oldFileNameInR2) {
                await deleteMedia(oldFileNameInR2);
            }
        }

        // Upload new avatar
        const fileExtension = file.originalname.split('.').pop();
        const fileNameInR2 = `groups/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const uploadResult = await uploadMedia(file.buffer, fileNameInR2, file.mimetype);
        newAvatarUrl = MEDIA_URL + uploadResult.Location.split(".com/")[1].replace(BUCKET_NAME, "");
    }

    group.name = name || group.name; // Update name if provided
    group.avatarUrl = newAvatarUrl; // Update avatar URL
    await group.save();

    res.status(200).json({
        status: 'success',
        data: {
            group,
        },
    });
});

/**
 * Delete a Group by ID.
 * Requires authentication. Only the creator or admin can delete.
 * Includes cascading deletion of associated stories and blogs, and removal from user's groups.
 */
export const deleteGroup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id; // MongoDB User _id

    const group: IGroup | null = await Group.findById(req.params.id);

    if (!group) {
        return next(new AppError('No group found with that ID', 404));
    }

    if (!group.createdBy || group.createdBy.toString() !== userId) {
        return next(new AppError('You do not have permission to delete this group.', 403));
    }

    // Delete associated Stories and Blogs media and documents
    const storiesToDelete = await Story.find({ group: group._id });
    for (const story of storiesToDelete) {
        if (story.mediaUrl) {
            const fileNameInR2 = story.mediaUrl.replace(`${MEDIA_URL}/`, '');
            if (fileNameInR2) {
                await deleteMedia(fileNameInR2);
            }
        }
        await story.deleteOne();
    }
    await Blog.deleteMany({ group: group._id });

    // Delete group avatar if it exists
    if (group.avatarUrl) {
        const fileNameInR2 = group.avatarUrl.replace(`${MEDIA_URL}/`, '');
        if (fileNameInR2) {
            await deleteMedia(fileNameInR2);
        }
    }

    // Remove group from the creator's user document
    await User.findByIdAndUpdate(userId, {
        $pull: { groups: group._id }
    });

    // Delete the Group itself
    await group.deleteOne();

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

export const archiveGroup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { archived } = req.body;
    const userId = req.user?._id; // MongoDB User _id

    const group: IGroup | null = await Group.findById(req.params.id);

    if (!group) {
        return next(new AppError('No group found with that ID', 404));
    }

    if (!group.createdBy || group.createdBy.toString() !== userId) {
        return next(new AppError('You do not have permission to update this group.', 403));
    }

    group.isArchived = archived || group.isArchived; // Update archived status
    await group.save(); // Save to trigger updatedAt timestamp

    res.status(200).json({
        status: 'success',
        data: {
            group,
        },
    });
});