// src/models/Group.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import { IStory } from './Story'; // Import interfaces for population typing
import { IBlog } from './Blog';   // Import interfaces for population typing
import { IUser } from './User';   // Import interfaces for population typing

// Define the TypeScript interface for a Group Document
export interface IGroup extends Document {
    name: string;
    createdBy: Types.ObjectId | IUser; // Reference to User ID who created the group
    stories: Types.ObjectId[] | IStory[]; // Can be IDs or populated Story documents
    blogs: Types.ObjectId[] | IBlog[];   // Can be IDs or populated Blog documents
    createdAt: Date;
    updatedAt: Date;
    isArchived: boolean;
    avatarUrl: string;
}

const groupSchema: Schema = new Schema<IGroup>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    createdBy: { // ADDED THIS FIELD TO THE SCHEMA
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model who created the group
        required: true,
        index: true // Index for efficient lookup by creator
    },
    stories: [{
        type: Schema.Types.ObjectId,
        ref: 'Story'
    }],
    blogs: [{
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    }],
    avatarUrl: {
        type: String
    },
    isArchived: { // <--- ADD THIS FIELD
        type: Boolean,
        default: false,
        index: true // Add an index for efficient querying
      },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Group = mongoose.model<IGroup>('Group', groupSchema);
export default Group;