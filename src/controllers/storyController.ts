// src/controllers/storyController.ts
import { Request, Response, NextFunction } from 'express';
import Story from '../models/Story';
import Group from '../models/Group';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { uploadMedia, deleteMedia } from '../services/r2Service';
import { getEnvVariable } from '../config/env';

const MEDIA_URL = getEnvVariable('MEDIA_URL');
const BUCKET_NAME = getEnvVariable('CLOUDFLARE_R2_BUCKET_NAME');


export const createStory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { groupId, title, description, htmlContent } = req.body; // ADD htmlContent
    const createdBy = req.user?._id;

    if (!createdBy) {
        return next(new AppError('Creator ID not found. Authentication required.', 401));
    }

    const file = (req as any).file;

    if (!file) {
        return next(new AppError('Story media file is required.', 400));
    }

    const group = await Group.findById(groupId);
    if (!group) {
        return next(new AppError('Group not found with that ID.', 404));
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileNameInR2 = `stories/${createdBy}/${groupId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    const uploadResult = await uploadMedia(file.buffer, fileNameInR2, file.mimetype);

    const newStory = await Story.create({
        group: groupId,
        createdBy,
        title,
        description,
        htmlContent, // ADD htmlContent
        mediaUrl: MEDIA_URL + uploadResult.Location.split(".com/")[1].replace(BUCKET_NAME, ""),
    });

    await Group.findByIdAndUpdate(groupId, { $push: { stories: newStory._id } });
    await User.findByIdAndUpdate(createdBy, { $push: { stories: newStory._id } });

    res.status(201).json({
        status: 'success',
        data: {
            story: newStory,
        },
    });
});


export const getAllStories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query: any = {};
    if (req.query.group) query.group = req.query.group;
    if (req.query.createdBy) query.createdBy = req.query.createdBy;

    const stories = await Story.find(query)
        .populate('group', 'name')
        .populate('createdBy', 'clerkId');

    res.status(200).json({
        status: 'success',
        results: stories.length,
        data: {
            stories,
        },
    });
});

export const getStory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const story = await Story.findById(req.params.id)
        .populate('group', 'name')
        .populate('createdBy', 'clerkId');

    if (!story) {
        return next(new AppError('No story found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            story,
        },
    });
});

export const updateStory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, htmlContent } = req.body; // ADD htmlContent
    const userId = req.user?._id;

    const story = await Story.findById(req.params.id);

    if (!story) {
        return next(new AppError('No story found with that ID', 404));
    }

    if (story.createdBy.toString() !== userId) {
        return next(new AppError('You do not have permission to update this story.', 403));
    }

    const file = (req as any).file;
    let newMediaUrl = story.mediaUrl;

    if (file) {
        const oldFileNameInR2 = story.mediaUrl.replace(`${MEDIA_URL}/`, '');
        if (oldFileNameInR2) {
            await deleteMedia(oldFileNameInR2);
        }

        const fileExtension = file.originalname.split('.').pop();
        const fileNameInR2 = `stories/${userId}/${story.group}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const uploadResult = await uploadMedia(file.buffer, fileNameInR2, file.mimetype);
        newMediaUrl = MEDIA_URL + uploadResult.Location.split(".com/")[1].replace(BUCKET_NAME, "");
    }

    story.title = title || story.title;
    story.description = description || story.description;
    story.htmlContent = htmlContent || story.htmlContent; // ADD htmlContent update
    story.mediaUrl = newMediaUrl;

    await story.save();

    res.status(200).json({
        status: 'success',
        data: {
            story,
        },
    });
});

export const deleteStory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    const story = await Story.findById(req.params.id);

    if (!story) {
        return next(new AppError('No story found with that ID', 404));
    }

    if (story.createdBy.toString() !== userId) {
        return next(new AppError('You do not have permission to delete this story.', 403));
    }

    const fileNameInR2 = story.mediaUrl.replace(`${MEDIA_URL}/`, '');
    if (fileNameInR2) {
        await deleteMedia(fileNameInR2);
    }

    await Group.findByIdAndUpdate(story.group, { $pull: { stories: story._id } });
    await User.findByIdAndUpdate(story.createdBy, { $pull: { stories: story._id } });

    await story.deleteOne();

    res.status(204).json({
        status: 'success',
        data: null,
    });
});