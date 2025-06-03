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

    getAllPosts = async (req: Request, res: Response) => {
        const result = await this.postQueryRepository.getPosts(req.query);
        res.status(200).json(result);
    };

    getPostById = async (req: Request, res: Response) => {
        const post = await this.postQueryRepository.getById(req.params.id);
        post ? res.json(post) : res.sendStatus(404);
    };

    createPost = async (req: Request, res: Response) => {
        const newPost = await this.postService.createPost(req.body);
        newPost ? res.status(201).json(newPost) : res.sendStatus(400);
    }

    updatePost = async (req: Request, res: Response) => {
        const updated = await this.postService.updatePost(req.params.id, req.body);
        updated ? res.sendStatus(204) : res.sendStatus(404);
    }

    deletePost = async (req: Request, res: Response) => {
        const deleted = await this.postService.deletePost(req.params.id);
        deleted ? res.sendStatus(204) : res.sendStatus(404);
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
                res.sendStatus(204);
                return;
            default:
                res.sendStatus(500);
                return;
        }
    }

}