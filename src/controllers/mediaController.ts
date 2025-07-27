// src/controllers/mediaController.ts
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { uploadMedia, deleteMedia } from '../services/r2Service'; // Re-use your R2 service functions
import { getEnvVariable } from '../config/env';

const MEDIA_URL = getEnvVariable('MEDIA_URL');
const BUCKET_NAME = getEnvVariable('CLOUDFLARE_R2_BUCKET_NAME');

/**
 * @desc Uploads a single media file to R2 and returns its URL
 * @route POST /api/v1/upload/media
 * @access Protected (only authenticated users can upload)
 */
export const uploadSingleMedia = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const file = (req as any).file; // Multer adds the file to req.file

    if (!file) {
        return next(new AppError('No media file provided for upload.', 400));
    }

    const userId = req.user?._id; // Assuming req.user is populated by your protect middleware

    if (!userId) {
        return next(new AppError('Authentication required to upload media.', 401));
    }

    // Determine file extension
    const fileExtension = file.originalname.split('.').pop();
    // Create a unique file name, categorize by user for better organization in R2
    const fileNameInR2 = `uploads/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    const uploadResult = await uploadMedia(file.buffer, fileNameInR2, file.mimetype);

    if (!uploadResult || !uploadResult.Location) {
        return next(new AppError('Failed to get upload location from R2.', 500));
    }

    // Construct the public URL
    const mediaUrl = MEDIA_URL + uploadResult.Location.split(".com/")[1].replace(BUCKET_NAME, "");

    res.status(201).json({
        status: 'success',
        data: {
            url: mediaUrl,
            fileName: fileNameInR2, // Optionally return the R2 file name
        },
    });
});

// You could add a delete media endpoint here too if needed for cleanup
// export const deleteSingleMedia = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const { fileName } = req.body; // Expect the R2 file name
//     const userId = req.user?._id;

//     if (!fileName) {
//         return next(new AppError('File name is required for deletion.', 400));
//     }
//     if (!userId) {
//         return next(new AppError('Authentication required for deletion.', 401));
//     }

//     // Basic check: ensure user is deleting their own uploads, or have admin rights
//     if (!fileName.includes(`uploads/${userId}/`)) {
//          return next(new AppError('You do not have permission to delete this file.', 403));
//     }

//     await deleteMedia(fileName);

//     res.status(204).json({
//         status: 'success',
//         data: null,
//     });
// });