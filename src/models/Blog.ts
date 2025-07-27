// src/models/Blog.ts
import mongoose, { Schema, Document, Types } from 'mongoose'; // For population typing
import { IUser } from './User';   // For population typing
import { IGroup } from './Group';

// Define the TypeScript interface for a Blog Document
export interface IBlog extends Document {
    group: Types.ObjectId | IGroup; // Reference to Group ID
    createdBy: Types.ObjectId | IUser; // Reference to User ID who created it
    title: string;
    content: string; // The full content of the blog post
    thumbNailImage: string; // URL to the thumbnail image in Cloudflare R2
    thumbNailText: string; // Short text for the thumbnail/preview
    createdAt: Date;
    updatedAt: Date;
}

const blogSchema: Schema = new Schema<IBlog>({
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group', // Reference to the Group model
        required: true,
        index: true // Index for efficient lookup by group
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model who created the blog
        required: true,
        index: true // Index for efficient lookup by creator
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    thumbNailImage: {
        type: String,
        required: true
    },
    thumbNailText: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200 // Example max length
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Blog = mongoose.model<IBlog>('Blog', blogSchema);
export default Blog;