// src/controllers/blogController.ts
import { Request, Response, NextFunction } from 'express';
import Blog from '../models/Blog';
import Group from '../models/Group';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { uploadMedia, deleteMedia } from '../services/r2Service'; // Your R2 media service
import { getEnvVariable } from '../config/env';

/**
 * Create a new Blog.
 * Requires authentication and a thumbnail file upload.
 */

const MEDIA_URL = getEnvVariable('MEDIA_URL');
const BUCKET_NAME = getEnvVariable('CLOUDFLARE_R2_BUCKET_NAME');


export const createBlog = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { groupId, title, content, thumbNailText } = req.body;
    const createdBy = req.user?._id; // MongoDB User _id

    if (!createdBy) {
        return next(new AppError('Creator ID not found. Authentication required.', 401));
    }

    const file = (req as any).file; // Assuming file upload middleware for thumbnail

    if (!file) {
        return next(new AppError('Blog thumbnail image is required.', 400));
    }

    // 1. Find the group and ensure it exists
    const group = await Group.findById(groupId);
    if (!group) {
        return next(new AppError('Group not found with that ID.', 404));
    }

    // 2. Upload thumbnail image to Cloudflare R2
    const fileExtension = file.originalname.split('.').pop();
    const fileNameInR2 = `blogs/${createdBy}/${groupId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    const uploadResult = await uploadMedia(file.buffer, fileNameInR2, file.mimetype);

    // 3. Create the new blog document
    const newBlog = await Blog.create({
        group: groupId,
        createdBy,
        title,
        content,
        thumbNailText,
        thumbNailImage: MEDIA_URL + uploadResult.Location.split(".com/")[1].replace(BUCKET_NAME, ""), // Store the public URL from R2
    });

    // 4. Add the new blog's ID to the associated Group and User documents
    await Group.findByIdAndUpdate(groupId, { $push: { blogs: newBlog._id } });
    await User.findByIdAndUpdate(createdBy, { $push: { blogs: newBlog._id } });

    res.status(201).json({
        status: 'success',
        data: {
            blog: newBlog,
        },
    });
});

/**
 * Get all Blogs.
 * Requires authentication. Can be filtered by group or user.
 */
export const getAllBlogs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query: any = {};
    if (req.query.group) query.group = req.query.group;
    if (req.query.createdBy) query.createdBy = req.query.createdBy;

    const blogs = await Blog.find(query)
        .populate('group', 'name')
        .populate('createdBy', 'clerkId');

    res.status(200).json({
        status: 'success',
        results: blogs.length,
        data: {
            blogs,
        },
    });
});

/**
 * Get a single Blog by ID.
 * Requires authentication.
 */
export const getBlog = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const blog = await Blog.findById(req.params.id)
        .populate('group', 'name')
        .populate('createdBy', 'clerkId');

    if (!blog) {
        return next(new AppError('No blog found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            blog,
        },
    });
});

/**
 * Update a Blog by ID.
 * Requires authentication. Only the creator or admin can update.
 * Can optionally update thumbnail image.
 */
export const updateBlog = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { title, content, thumbNailText } = req.body;
    const userId = req.user?._id; // MongoDB User _id

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return next(new AppError('No blog found with that ID', 404));
    }

    // Authorization: Only the creator can update the blog (or an admin)
    if (blog.createdBy.toString() !== userId) {
        return next(new AppError('You do not have permission to update this blog.', 403));
    }

    // Handle optional thumbnail image update
    const file = (req as any).file;
    let newThumbNailImage = blog.thumbNailImage;

    if (file) {
        // Delete old thumbnail from R2
        const oldFileName = blog.thumbNailImage.split('/').pop(); // Extract filename from URL (simplistic)
        if (oldFileName) {
            await deleteMedia(`blogs/${userId}/${blog.group}/${oldFileName}`); // Adjust path as per your R2 key structure
        }

        // Upload new thumbnail to R2
        const fileExtension = file.originalname.split('.').pop();
        const fileNameInR2 = `blogs/${userId}/${blog.group}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const uploadResult = await uploadMedia(file.buffer, fileNameInR2, file.mimetype);
        newThumbNailImage = MEDIA_URL + uploadResult.Location.split(".com./")[1].replace(BUCKET_NAME, "");
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.thumbNailText = thumbNailText || blog.thumbNailText;
    blog.thumbNailImage = newThumbNailImage; // Update with new URL if media changed

    await blog.save(); // Save to trigger updatedAt timestamp

    res.status(200).json({
        status: 'success',
        data: {
            blog,
        },
    });
});

/**
 * Delete a Blog by ID.
 * Requires authentication. Only the creator or admin can delete.
 * Removes thumbnail from R2 and removes blog ID from associated Group and User.
 */
export const deleteBlog = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id; // MongoDB User _id

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return next(new AppError('No blog found with that ID', 404));
    }

    // Authorization: Only the creator can delete the blog (or an admin)
    if (blog.createdBy.toString() !== userId) {
        return next(new AppError('You do not have permission to delete this blog.', 403));
    }

    // 1. Delete thumbnail from Cloudflare R2
    const fileNameInR2 = blog.thumbNailImage.split('/').pop(); // Extract filename from URL (simplistic)
    if (fileNameInR2) {
        await deleteMedia(`blogs/${userId}/${blog.group}/${fileNameInR2}`); // Adjust path as per your R2 key structure
    }

    // 2. Remove blog ID from associated Group and User documents
    await Group.findByIdAndUpdate(blog.group, { $pull: { blogs: blog._id } });
    await User.findByIdAndUpdate(blog.createdBy, { $pull: { blogs: blog._id } });

    // 3. Delete the Blog document itself
    await blog.deleteOne();

    res.status(204).json({
        status: 'success',
        data: null,
    });
});