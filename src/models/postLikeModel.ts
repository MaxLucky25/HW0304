import { Schema, model, Types, Document } from 'mongoose';

export enum LikeUpdateResult {
    Updated = 'Updated',
    NoChange = 'NoChange',
    NotFound = 'NotFound'
}

export enum LikeStatusEnum {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike'
}

export interface IPostLike extends Document<Types.ObjectId> {
    postId: string;
    userId: string;
    login: string;
    status: LikeStatusEnum;
    addedAt: Date;
}

const postLikeSchema = new Schema<IPostLike>({
    postId: { type: String, required: true },
    userId: { type: String, required: true },
    login: { type: String, required: true },
    status: { type: String, enum: Object.values(LikeStatusEnum), required: true },
    addedAt: { type: Date, required: true }
});

export const PostLikeModel = model<IPostLike>('PostLike', postLikeSchema);
