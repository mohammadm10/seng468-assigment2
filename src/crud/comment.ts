import { MongoClient, ObjectId } from 'mongodb';
import { CommentCollection } from '../database/schema';

const uri = 'mongodb://localhost:27017/mydatabase';

//Add comment to post
export async function addComment(postId: string, comment: string, commentAuthor: string): Promise<any | null> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const newComment: any = {
            id: new ObjectId(),
            author: commentAuthor,
            post: postId,
            content: comment,
            likes: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await CommentCollection.insertOne(newComment);
        console.log(`Added comment with commentId: ${result.insertedId}`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

//Fetch comments on post
export async function getComments(postId: string): Promise<any | null> {
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
export async function likeComment(commentId: ObjectId): Promise<any | null> {
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
export async function getLikes(commentId: ObjectId): Promise<any | null> {
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