// src/models/User.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import { IStory } from './Story';
import { IBlog } from './Blog';
import { IGroup } from './Group';

// Define the TypeScript interface for a User Document
export interface IUser extends Document {
    clerkId: string;
    approvedStatus: boolean;
    stories: Types.ObjectId[] | IStory[]; // Array of Story ObjectIds created by this user
    blogs: Types.ObjectId[] | IBlog[];     // Array of Blog ObjectIds created by this user
    groups: Types.ObjectId[] | IGroup[];   // Array of Group ObjectIds created by this user
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema = new Schema<IUser>({
    clerkId: {
        type: String,
        required: true,
        unique: true,
        index: true // Index for efficient lookup by Clerk ID
    },
    approvedStatus: {
        type: Boolean,
        default: false // Default to false, an admin would set this to true
    },
    stories: [{
        type: Schema.Types.ObjectId,
        ref: 'Story' // Reference to the Story model
    }],
    blogs: [{
        type: Schema.Types.ObjectId,
        ref: 'Blog' // Reference to the Blog model
    }],
    groups: [{
        type: Schema.Types.ObjectId,
        ref: 'Group' // Reference to the Group model
    }]
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;