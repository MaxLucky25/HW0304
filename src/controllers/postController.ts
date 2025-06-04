import {Response, Request} from "express";
import {inject, injectable} from "inversify";
import TYPES from "../di/types";
import {PostService} from "../services/postService";
import {CommentService} from "../services/commentService";
import {PostQueryRepository} from "../queryRepo/postQueryRepository";
import {CommentQueryRepository} from "../queryRepo/commentQueryRepository";
import {LikeUpdateResult} from "../models/postLikeModel";

@injectable()
export class PostController {
    constructor(
        @inject(TYPES.PostService) private postService: PostService,
        @inject(TYPES.PostQueryRepository) private postQueryRepository: PostQueryRepository,
        @inject(TYPES.CommentQueryRepository) private commentQueryRepository: CommentQueryRepository,
        @inject(TYPES.CommentService) private commentService: CommentService,
    ) {}

    getAll = async (req: Request, res: Response) => {
        const result = await this.postQueryRepository.getPosts(req.query, req.userId ?? undefined);
        res.send(result);
    }

    getById = async (req: Request, res: Response) => {
        const post = await this.postQueryRepository.getById(req.params.id, req.userId ?? undefined);
        if (!post) {
            res.sendStatus(404);
            return;
        }
        res.send(post);
    }

    getPostsByBlogId = async (req: Request, res: Response) => {
        const result = await this.postQueryRepository.getPostsByBlogId(req.params.blogId, req.query, req.userId ?? undefined);
        res.send(result);
    }

    createPost = async (req: Request, res: Response) => {
        const newPost = await this.postService.createPost({
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
        });

        if (!newPost) {
            res.sendStatus(404);
            return;
        }
        res.status(201).send(newPost);
    }

    createPostByBlogId = async (req: Request, res: Response) => {
        const newPost = await this.postService.createPost({
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.params.blogId,
        });

        if (!newPost) {
            res.sendStatus(404);
            return;
        }
        res.status(201).send(newPost);
    }

    setLikeStatus = async (req: Request, res: Response) => {
        const postId = req.params.postId;
        const userId = req.userId!;
        const likeStatus = req.body.likeStatus;

        const result = await this.postService.updateLikeStatus(postId, userId, likeStatus);

        switch (result) {
            case LikeUpdateResult.NotFound:
                res.sendStatus(404);
                return;
            case LikeUpdateResult.NoChange:
            case LikeUpdateResult.Updated:
                const updatedPost = await this.postQueryRepository.getById(postId, userId);
                if (!updatedPost) {
                    res.sendStatus(404);
                    return;
                }
                res.sendStatus(204);
                return;
            default:
                res.sendStatus(500);
                return;
        }
    }

    updatePost = async (req: Request, res: Response) => {
        const isUpdated = await this.postService.updatePost(req.params.id, {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
        });

        if (!isUpdated) {
            res.sendStatus(404);
            return;
        }
        res.sendStatus(204);
    }

    deletePost = async (req: Request, res: Response) => {
        const isDeleted = await this.postService.deletePost(req.params.id);
        if (!isDeleted) {
            res.sendStatus(404);
            return;
        }
        res.sendStatus(204);
    }

    createComment = async (req: Request, res: Response) => {
        const { postId } = req.params;
        const commentatorInfo = {
            userId: req.userId!,
            userLogin: req.userLogin!
        };
        const newComment = await this.commentService.createComment(postId, { content: req.body.content }, commentatorInfo);
        if (newComment) {
            res.status(201).json(newComment);
        } else {
            res.sendStatus(404);
        }
    }

    getCommentsByPostId = async (req: Request, res: Response) => {
        const { postId } = req.params;
        const userId = req.userId || undefined;
        const comments = await this.commentQueryRepository.getCommentsByPostId(postId, req.query, userId);
        if (comments === null) {
            res.sendStatus(404);
        } else {
            res.status(200).json(comments);
        }
    }
}