import { MongoClient, ObjectId } from 'mongodb';
import { PostCollection } from '../database/schema';

const uri = 'mongodb://localhost:27017/mydatabase';

//Insert a new post
export async function newPost(
    author: String,
    title: String,
    content: String
): Promise<void> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const newPost: any = {
            id: new ObjectId(),
            title,
            content,
            author,
            likes: 0,
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await PostCollection.insertOne(newPost);
        console.log(`Inserted post with id: ${result.insertedId}`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

//Like a post
export async function likePost(postId: ObjectId): Promise<any | null> {
    const query = { _id: new ObjectId(postId) };
    const update = { $inc: { likes: 1 }, $set: { updatedAt: Date.now() } };
    try {
        const result = await PostCollection.updateOne(query, update);
        console.log(`Updated ${result.modifiedCount} user with id: ${postId}`);
        return result;
    } catch (err) {
        console.error(err);
        return null;
    }
}

//Get the likes from a post
export async function getLikes(postId: ObjectId): Promise<any | null> {
    const client = new MongoClient(uri);
    const query = { _id: new ObjectId(postId) };
    const projection = { likes: 1 };
    try {
        await client.connect();
        const result = await PostCollection.findOne(query, { projection });
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

//Fetch a post
export async function getPostWithAuthor(postId: ObjectId): Promise<any | null> {
    const client = new MongoClient(uri);
    const query = { _id: new ObjectId(postId) };
    const projection = { id: 1, title: 1, content: 1, author: 1, likes: 1, comments: 1 };
    try {
        await client.connect();
        const result = await PostCollection.findOne(query, { projection });
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

//Delete post
export async function deleteUserById(postId: ObjectId): Promise<boolean> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const result = await PostCollection.deleteOne({ _id: new ObjectId(postId) });
        return result.deletedCount === 1;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        await client.close();
    }
}