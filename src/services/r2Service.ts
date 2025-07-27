// src/services/r2Service.ts
import createR2 from 'fast-r2'; // Import your published fast-r2 module
import { getEnvVariable } from '../config/env'; // Utility to get environment variables

// Retrieve R2 credentials from environment variables using your config utility
const CLOUDFLARE_ACCOUNT_ID = getEnvVariable('CLOUDFLARE_ACCOUNT_ID');
const CLOUDFLARE_R2_ACCESS_KEY_ID = getEnvVariable('CLOUDFLARE_R2_ACCESS_KEY_ID');
const CLOUDFLARE_R2_SECRET_ACCESS_KEY = getEnvVariable('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
const CLOUDFLARE_R2_BUCKET_NAME = getEnvVariable('CLOUDFLARE_R2_BUCKET_NAME');
const CLOUDFLARE_R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT; // Optional, can be undefined

// Initialize fast-r2 client
const r2Client = createR2({
    accountId: CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    bucketName: CLOUDFLARE_R2_BUCKET_NAME,
    endpoint: CLOUDFLARE_R2_ENDPOINT // Pass endpoint if it's set, otherwise fast-r2 will derive
});

/**
 * Uploads media (image/video) to Cloudflare R2.
 * @param fileBuffer The buffer of the file to upload.
 * @param fileName The desired key/path for the file in R2 (e.g., 'stories/user-id/image.jpg').
 * @param contentType The MIME type of the file (e.g., 'image/jpeg').
 * @returns A promise that resolves to the upload information including the public URL.
 * @throws {Error} If the upload fails.
 */
export const uploadMedia = async (fileBuffer: Buffer, fileName: string, contentType: string) => {
    try {
        const uploadResult = await r2Client.uploadFile(fileBuffer, fileName, contentType);
        console.log(`Media uploaded to R2: ${uploadResult.Location}`);
        return uploadResult;
    } catch (error: any) {
        console.error('Error uploading media to R2:', error);
        throw new Error(`Failed to upload media to R2: ${error.message}`);
    }
};

/**
 * Deletes media from Cloudflare R2.
 * @param fileName The key/path of the file to delete from R2.
 * @returns A promise that resolves when the file is deleted.
 * @throws {Error} If the deletion fails.
 */
export const deleteMedia = async (fileName: string) => {
    try {
        await r2Client.deleteFile(fileName);
        console.log(`Media deleted from R2: ${fileName}`);
    } catch (error: any) {
        console.error('Error deleting media from R2:', error);
        throw new Error(`Failed to delete media from R2: ${error.message}`);
    }
};

// You might add other R2-related functions here, e.g., for getting signed URLs if needed.