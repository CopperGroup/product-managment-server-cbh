// src/utils/multerConfig.ts
import multer from 'multer';
import AppError from './appError';

// Configure storage to keep files in memory as a Buffer
const multerStorage = multer.memoryStorage();

// Filter for allowed file types (images and videos)
const multerFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image or video! Please upload only images or videos.', 400));
    }
};

// Initialize multer upload instance
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB file size limit (adjust as needed)
    }
});

export default upload;