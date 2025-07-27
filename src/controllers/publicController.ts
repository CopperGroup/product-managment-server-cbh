// src/controllers/publicController.ts
import { Request, Response, NextFunction } from 'express';
import Group from '../models/Group';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

/**
 * @desc Fetches stories for a specific group by its ID.
 * @route GET /api/v1/public/groups/:id/stories
 * @access Public
 */
export const fetchGroupStories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id: groupId } = req.params; // Get group ID from URL params

    const groupWithStories = await Group.findById(groupId)
        .populate({
            path: 'stories',
            // Only select necessary fields for public viewing
            select: 'title description mediaUrl htmlContent createdAt',
            populate: {
                path: 'createdBy',
                select: 'clerkId firstName lastName imageUrl' // Populate more user info for public view
            }
        })
        .select('name description avatarUrl isArchived'); // Select relevant group fields

    if (!groupWithStories) {
        return next(new AppError('No group found with that ID.', 404));
    }

    if (groupWithStories.isArchived) {
        return next(new AppError('This group is archived and its content is not publicly accessible.', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            group: groupWithStories, // Return the group object with populated stories
            stories: groupWithStories.stories // Also return stories directly for convenience
        },
    });
});

/**
 * @desc Fetches blogs for a specific group by its ID.
 * @route GET /api/v1/public/groups/:id/blogs
 * @access Public
 */
export const fetchGroupBlogs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id: groupId } = req.params; // Get group ID from URL params

    const groupWithBlogs = await Group.findById(groupId)
        .populate({
            path: 'blogs',
            // Only select necessary fields for public viewing
            select: 'title content thumbNailText thumbNailImage createdAt',
            populate: {
                path: 'createdBy',
                select: 'clerkId firstName lastName imageUrl' // Populate more user info for public view
            }
        })
        .select('name description avatarUrl isArchived'); // Select relevant group fields

    if (!groupWithBlogs) {
        return next(new AppError('No group found with that ID.', 404));
    }

    if (groupWithBlogs.isArchived) {
        return next(new AppError('This group is archived and its content is not publicly accessible.', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            group: groupWithBlogs, // Return the group object with populated blogs
            blogs: groupWithBlogs.blogs // Also return blogs directly for convenience
        },
    });
});

/**
 * @desc Fetches all publicly available (non-archived) groups.
 * @route GET /api/v1/public/groups
 * @access Public
 */
export const getAllPublicGroups = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Find all groups where isArchived is explicitly false
    const publicGroups = await Group.find({ "isArchived": false }).select('name isArchived avatarUrl') // Select fields relevant for a public listing

    if (!publicGroups || publicGroups.length === 0) {
        return next(new AppError('No public groups found.', 404));
    }

    res.status(200).json({
        status: 'success',
        results: publicGroups.length,
        data: {
            groups: publicGroups,
        },
    });
});