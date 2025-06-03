import { Router} from 'express';
import {likeStatusValidator, postValidator} from '../validators/postValidators';
import { authBasicMiddleware } from '../middlewares/authBasicMiddleware';
import { inputCheckErrorsMiddleware } from '../middlewares/inputCheckErrorMiddleware';
import {authJwtMiddleware, optionalAuthJwtMiddleware} from "../middlewares/authJwtMiddleware";
import {commentCreateValidator} from "../validators/commentValidators";
import container from "../di/iosContaner";
import { PostController } from '../controllers/postController';
import TYPES from "../di/types";

const controller = container.get<PostController>(TYPES.PostController);

export const postsRouter = Router();

postsRouter.get('/', controller.getAllPosts);

postsRouter.get('/:id', controller.getPostById);

postsRouter.post('/',
    authBasicMiddleware,
    postValidator,
    inputCheckErrorsMiddleware,
    controller.createPost
);

postsRouter.put('/:id',
    authBasicMiddleware,
    postValidator,
    inputCheckErrorsMiddleware,
    controller.updatePost
);

postsRouter.delete('/:id',
    authBasicMiddleware,
    controller.deletePost
);

postsRouter.get('/:postId/comments',
    optionalAuthJwtMiddleware,
    controller.getCommentsByPostId
);

postsRouter.post('/:postId/comments',
    authJwtMiddleware,
    commentCreateValidator,
    inputCheckErrorsMiddleware,
    controller.createComment
);

postsRouter.put('/:postId/like-status',
    authJwtMiddleware,
    likeStatusValidator,
    inputCheckErrorsMiddleware,
    controller.setLikeStatus
);