import {body} from 'express-validator';
import {BlogModel} from "../models/blogModel";
import {toObjectId} from "../utility/toObjectId";


 export const postValidator =[
    body('title')
        .trim()
        .isLength({ min: 1, max: 30 }).withMessage('Title length 1-30')
        .notEmpty().withMessage('Title is required'),

        body('shortDescription')
            .trim()
            .isLength({ min: 1, max: 100 }).withMessage('Short description length 1-100')
            .notEmpty().withMessage('Short description is required'),

        body('content')
            .trim()
            .isLength({ min: 1, max: 1000 }).withMessage('Content length 1-1000')
            .notEmpty().withMessage('Content is required'),
        body('blogId')
        .optional()
        .custom(async (value) => {
            const blog = await BlogModel.findOne({_id: toObjectId(value)});
            if (!blog) throw new Error('Blog not found');
            return true;
        })
        .withMessage('Invalid blogId')
];

export const likeStatusValidator = [
    body('likeStatus')
        .isIn(['Like', 'Dislike', 'None'])
        .withMessage('likeStatus must be Like, Dislike or None'),
];

