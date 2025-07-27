// src/models/Story.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './User';
import { IGroup } from './Group';

// Define the TypeScript interface for a Story Document
export interface IStory extends Document {
    group: Types.ObjectId | IGroup;
    createdBy: Types.ObjectId | IUser;
    title: string;
    mediaUrl: string; // URL to the story's image/video in Cloudflare R2
    description?: string; // Optional short description
    htmlContent?: string; // NEW: HTML content for the story body
    createdAt: Date;
    updatedAt: Date;
}

const storySchema: Schema = new Schema<IStory>({
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
        index: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    htmlContent: { // NEW FIELD
        type: String,
        trim: true,
        default: ''
    },
}, {
    timestamps: true
});

const Story = mongoose.model<IStory>('Story', storySchema);
export default Story;