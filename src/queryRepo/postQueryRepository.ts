import {PostModel, PostViewModel } from '../models/postModel';
import { getPaginationParams } from '../utility/commonPagination';
import {injectable} from "inversify";
import {toObjectId} from "../utility/toObjectId";

@injectable()
export class PostQueryRepository {

    async getById(id: string, userId?: string): Promise<PostViewModel | null> {
       const post = await PostModel.findOne({_id: toObjectId(id)});
       return post ? post.toExtendedViewModel(userId) : null;
    }

    async getPosts(query: any, userId?: string): Promise<any> {
        const { pageNumber, pageSize, sortBy, sortDirection } = getPaginationParams(query);
        const filter = {};
        const totalCount = await PostModel.countDocuments(filter);
        const pagesCount = Math.ceil(totalCount / pageSize);

        const itemsDocs = await PostModel.find(filter)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)

        const items = await Promise.all(itemsDocs.map((post) => post.toExtendedViewModel(userId)));

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items: items,
        };
    }

    async getPostsByBlogId(blogId: string, query: any, userId?: string): Promise<any> {
        const { pageNumber, pageSize, sortBy, sortDirection } = getPaginationParams(query);
        const filter = { blogId: toObjectId(blogId) };
        const totalCount = await PostModel.countDocuments(filter);
        const pagesCount = Math.ceil(totalCount / pageSize);
        const itemsDocs = await PostModel.find(filter)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)


        const items = await Promise.all(itemsDocs.map((post) => post.toExtendedViewModel(userId)));

        return {
            pagesCount,
            page: pageNumber,
            pageSize,
            totalCount,
            items: items,
        };
    }
}
