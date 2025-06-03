import {PostDto, PostModel, PostViewModel} from '../models/postModel';
import {injectable} from "inversify";
import {BlogModel} from "../models/blogModel";
import {toObjectId} from "../utility/toObjectId";
import {UserModel} from "../models/userModel";
import {LikeStatusEnum, LikeUpdateResult, PostLikeModel } from '../models/postLikeModel';

@injectable()
export class PostRepository {
    async create(input:PostDto): Promise<PostViewModel | null> {
        const blog = await BlogModel.findOne({_id: toObjectId(input.blogId)});
        if (!blog) return null;

        const newPost = await PostModel.createPost ({
            title: input.title,
            shortDescription: input.shortDescription,
            content: input.content,
            blogId: input.blogId,
            blogName: blog.name,
        });

        return newPost.toViewModel();
    }

    async update(id: string, input:PostDto): Promise<boolean> {
        const post = await PostModel.findOne({_id: toObjectId(id)});
        if (!post) return false;
        const blog = await BlogModel.findOne({_id: toObjectId(input.blogId)});
        if (!blog) return false;

        post.title = input.title;
        post.shortDescription = input.shortDescription;
        post.content = input.content;
        post.blogId = toObjectId(input.blogId);
        post.blogName = blog.name;

        await post.save();
        return true;
    }

    async delete(id: string): Promise<boolean> {
        const result = await PostModel.deleteOne({_id: toObjectId(id)});
        return result.deletedCount === 1;
    }

    async updateLikeStatus(postId: string, userId: string, likeStatus: LikeStatusEnum): Promise<'Updated' | 'NoChange' | 'NotFound'> {
        const post = await PostModel.findById(postId);
        if (!post) return LikeUpdateResult.NotFound;

        const user = await UserModel.findById(userId);
        if (!user) return LikeUpdateResult.NotFound;

        const existing = await PostLikeModel.findOne({ postId, userId });

        if (existing && existing.status === likeStatus) return LikeUpdateResult.NoChange;

        if (existing) {
            if (likeStatus === LikeStatusEnum.None) {
                await existing.deleteOne();
            } else {
                existing.status = likeStatus;
                existing.addedAt = new Date();
                await existing.save();
            }
        } else if (likeStatus !== LikeStatusEnum.None) {
            await PostLikeModel.create({
                postId,
                userId,
                login: user.login,
                status: likeStatus,
                addedAt: new Date()
            });
        }

        await PostModel.updateLikeCounters(postId);
        return LikeUpdateResult.Updated;
    }
}