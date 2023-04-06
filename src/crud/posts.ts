import { MongoClient, ObjectId } from 'mongodb';
import { PostCollection } from '../database/schema';
import { addToCache, getFromCache } from '../redis/caching';

const uri = 'mongodb://localhost:27017/mydatabase';

//Insert a new post
export async function newPost(
    author: String,
    title: String,
    content: String
): Promise<void> {
    const client = new MongoClient(uri);
    const id = new ObjectId();
    try {
        await client.connect();
        const newPost: any = {
            id,
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
        addToCache(id.toString(), JSON.stringify(newPost));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

//Get post from cache
async function getPostCache(postId: string): Promise<any> {
    return new Promise((resolve, reject) => {
        getFromCache(postId, (val) => {
            if (val != null) {
                resolve(JSON.parse(val));
            } else {
                resolve(null);
            }
        });
    });
}

//Check if a post exists
export async function checkPostExists(postId: string): Promise<any> {
    const post = await getPostCache(postId);
    if (post) {
        //Post found in cache
        return JSON.stringify(post);
    } else {
        //Post not in cache, check DB
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const post = await PostCollection.findOne({ _id: new ObjectId(postId) });
            return post;
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            await client.close();
        }
    }
}

//Like a post
export async function likePost(postId: ObjectId): Promise<any> {
    const post = await checkPostExists(postId.toString());
    if (post) {
        const query = { _id: new ObjectId(postId) };
        const update = { $inc: { likes: 1 }, $set: { updatedAt: Date.now() } };
        try {
            const result = await PostCollection.updateOne(query, update);
            console.log(`Updated ${result.modifiedCount} user with id: ${postId}`);
            return JSON.stringify(result);;
        } catch (err) {
            console.error(err);
            return null;
        }
    } else {
        console.log(`No post with id ${postId} found`);
        return -1;
    }
}

//Get the likes from a post
export async function getLikes(postId: ObjectId): Promise<any> {
    const post = await checkPostExists(postId.toString());
    if (post) {
        return post;
    } else {
        const client = new MongoClient(uri);
        const query = { _id: new ObjectId(postId) };
        const projection = { likes: 1 };
        try {
            await client.connect();
            const result = await PostCollection.findOne(query, { projection });
            if (result) {
                return JSON.stringify(result);
            } else {
                console.log(`No post with id ${postId} found`);
                return -1;
            }
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            await client.close();
        }
    }
}

//Fetch a post
export async function getPostWithAuthor(postId: ObjectId): Promise<any> {
    const post = await checkPostExists(postId.toString());
    if (post) {
        return post;
    } else {
        const client = new MongoClient(uri);
        const query = { _id: new ObjectId(postId) };
        const projection = { id: 1, title: 1, content: 1, author: 1, likes: 1, comments: 1 };
        try {
            await client.connect();
            const result = await PostCollection.findOne(query, { projection });
            if (result) {
                return JSON.stringify(result);
            } else {
                console.log(`No post with id ${postId} found`);
                return -1;
            }
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            await client.close();
        }
    }
}

//Delete post
export async function deletePostById(postId: ObjectId): Promise<number> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const result = await PostCollection.deleteOne({ _id: new ObjectId(postId) });
        if (result) {
            return 1;
        } else {
            return 0;
        }
    } catch (err) {
        console.error(err);
        return 0;
    } finally {
        await client.close();
    }
}