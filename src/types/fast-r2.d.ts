// src/types/fast-r2.d.ts

// Declare the shape of the object returned by the createR2 factory function
interface FastR2Client {
    uploadFile: (fileBuffer: Buffer, fileName: string, contentType: string) => Promise<{
        Key: string;
        ETag?: string;
        Bucket: string;
        Location: string; // Public URL
        ContentType: string;
        Size: number;
    }>;
    deleteFile: (fileName: string) => Promise<void>;
    getFileUrl: (fileName: string) => string;
}

// Declare the shape of the createR2 factory function itself
declare module 'fast-r2' {
    interface FastR2Options {
        accountId: string;
        accessKeyId: string;
        secretAccessKey: string;
        bucketName: string;
        endpoint?: string;
    }

    // The default export is the createR2 function
    function createR2(options: FastR2Options): FastR2Client;
    export default createR2;
}