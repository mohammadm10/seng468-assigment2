import { MongoClient, ObjectId } from 'mongodb';
import { CommentCollection } from '../database/schema';
import { addToCommentCache, getCommentsForPost } from '../redis/caching';
import { checkPostExists } from './posts';

const uri = 'mongodb://localhost:27017/mydatabase';

//Add comment to post
export async function addComment(postId: string, comment: string, commentAuthor: string): Promise<any | null> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const id = new ObjectId();
        const newComment: any = {
            id,
            author: commentAuthor,
            post: postId,
            content: comment,
            likes: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await CommentCollection.insertOne(newComment);
        console.log(`Added comment with commentId: ${result.insertedId}`);
        addToCommentCache(postId, id.toString(), comment);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

//Check if a comment exists
export async function checkCommentExists(postId: string): Promise<any> {
    const comments = await getCommentsForPost(postId);
    if (comments) {
        //comments found in cache
        return JSON.stringify(comments);
    } else {
        //Post not in cache, check DB
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const post = await CommentCollection.find({ _id: new ObjectId(postId) });
            return post;
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            await client.close();
        }
    }
}

//Fetch comments on post
export async function getComments(postId: string): Promise<any> {
    const comments = await checkCommentExists(postId);
    if(comments){
        //Check if the post exists
        const post = await checkPostExists(postId);
        if(post){
            //Check if the post comments are cached
            const comments = await getCommentsForPost(postId);
            if(comments){
                return comments;
            }
        }
    }else{
        console.log(`No comments for post ${postId}`);
        return -1;
    }
    const client = new MongoClient(uri);
    const query = { _id: new ObjectId(postId) };
    const projection = { id: 1, content: 1, author: 1, likes: 1 };
    try {
        await client.connect();
        const result = await CommentCollection.find(query, { projection });
        if (result) {
            return result;
        } else {
            return null;
        }
    } catch (err) {
        console.error(err);
        return null;
    } finally {
        await client.close();
    }
}

//Like a comment
export async function likeComment(commentId: ObjectId): Promise<any> {
    const query = { _id: new ObjectId(commentId) };
    const update = { $inc: { likes: 1 }, $set: { updatedAt: Date.now() } };
    try {
        const result = await CommentCollection.updateOne(query, update);
        console.log(`Liked comment: ${commentId}`);
        return result;
    } catch (err) {
        console.error(err);
        return null;
    }
}

//Get comment likes
export async function getLikes(commentId: ObjectId): Promise<any> {
    const client = new MongoClient(uri);
    const query = { _id: new ObjectId(commentId) };
    const projection = { likes: 1 };
    try {
        await client.connect();
        const result = await CommentCollection.findOne(query, { projection });
        if (result) {
            return result;
        } else {
            return null;
        }
    } catch (err) {
        console.error(err);
        return null;
    } finally {
        await client.close();
    }
}