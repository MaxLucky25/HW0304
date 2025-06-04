import {Model, model, Schema, Document, Types} from "mongoose";
import {toObjectId} from "../utility/toObjectId";
import {LikeStatusEnum, PostLikeModel} from "./postLikeModel";


export type PostViewModel = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: Date;
};

export type PostDto = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
}

export type inputPostDto = {
    title: string;
    shortDescription: string;
    content: string;
}

export type LikeDetailsViewModel = {
    addedAt: Date;
    userId: string;
    login: string;
};

export type PostExtendedViewModel = PostViewModel & {
    extendedLikesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: LikeStatusEnum;
        newestLikes: LikeDetailsViewModel[];
    };
};

interface IPostDocument extends Document<Types.ObjectId> {
    title: string;
    shortDescription: string;
    content: string;
    blogId: Types.ObjectId;
    blogName: string;
    createdAt: Date;
    likesCount: number;
    dislikesCount: number;

    toViewModel(): PostViewModel;

    toExtendedViewModel(userId?: string): Promise<PostExtendedViewModel>;
}

interface IPostModelStatic extends Model<IPostDocument> {
    createPost(data:{
        title: string;
        shortDescription: string;
        content: string;
        blogId: string;
        blogName: string;
    }): Promise<IPostDocument>;
    updateLikeCounters(postId: string): Promise<void>;
}

const PostSchema = new Schema<IPostDocument>({
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    content: { type: String, required: true },
    blogId: { type: Schema.Types.ObjectId, required: true },
    blogName: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    likesCount: { type: Number, required: true, default: 0 },
    dislikesCount: { type: Number, required: true, default: 0 },

});

PostSchema.methods.toViewModel = function () :PostViewModel {
    return {
        id: this._id.toString(),
        title: this.title,
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: this.blogId.toString(),
        blogName: this.blogName,
        createdAt: this.createdAt,
    };
};

PostSchema.statics.createPost = function
({title, shortDescription, content, blogId, blogName})
    :Promise<IPostDocument> {
    const post = new this({
        title,
        shortDescription,
        content,
        blogId: toObjectId(blogId),
        blogName,
        createdAt: new Date(),
    });
    return post.save();
}

PostSchema.statics.updateLikeCounters = async function (postId: string) {
    const [likesCount, dislikesCount] = await Promise.all([
        PostLikeModel.countDocuments({ postId, status: LikeStatusEnum.Like }),
        PostLikeModel.countDocuments({ postId, status: LikeStatusEnum.Dislike }),
    ]);

    await this.findByIdAndUpdate(
        postId,
        { likesCount, dislikesCount },
        { new: true }
    );
};

PostSchema.methods.toExtendedViewModel = async function(userId?: string): Promise<PostExtendedViewModel> {
    const post = this as IPostDocument;

    const [myLike, newestLikesRaw] = await Promise.all([
        userId ? PostLikeModel.findOne({ postId: post._id.toString(), userId }) : null,
        PostLikeModel.find({ postId: post._id.toString(), status: LikeStatusEnum.Like })
            .sort({ addedAt: -1 })
            .limit(3)
            .lean()
    ]);

    const newestLikes: LikeDetailsViewModel[] = newestLikesRaw.map(like => ({
        addedAt: like.addedAt,
        userId: like.userId,
        login: like.login
    }));

    return {
        ...this.toViewModel(),
        extendedLikesInfo: {
            likesCount: this.likesCount,
            dislikesCount: this.dislikesCount,
            myStatus: myLike?.status ?? LikeStatusEnum.None,
            newestLikes
        }
    };
};


export const PostModel = model<IPostDocument, IPostModelStatic>('Post', PostSchema);

