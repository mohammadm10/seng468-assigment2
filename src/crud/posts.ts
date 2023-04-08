import { MongoClient, ObjectId } from 'mongodb';
import { PostCollection } from '../database/schema';
import { addToCache, getFromCache, getCommentsForPost } from '../redis/caching';

const uri = 'mongodb://localhost:27017/mydatabase';

interface Updates {
    likes?: number;
    title?: string;
    content?: string;
}

//Insert a new post
export async function newPost(
    author: String,
    title: String,
    content: String
): Promise<void> {
    const client = new MongoClient(uri);
    const _id = new ObjectId();
    try {
        await client.connect();
        const newPost: any = {
            _id,
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
        await addToCache(_id.toString(), JSON.stringify(newPost));
        return newPost;
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

//Get post from cache
async function getPostCache(postId: ObjectId): Promise<any> {
    return new Promise((resolve, reject) => {
        getFromCache(postId.toString(), (val) => {
            if (val != null) {
                resolve(JSON.parse(val));
            } else {
                resolve(null);
            }
        });
    });
}

//Check if a post exists
export async function checkPostExists(postId: ObjectId): Promise<any> {
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
    const post = await checkPostExists(postId);
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

//Update user details
export async function updatePost(postId: ObjectId, updates: Updates): Promise<any> {
    console.log(postId);
    const post = await checkPostExists(postId);
    if (post) {
      const client = new MongoClient(uri);
      const query = { _id: new ObjectId(postId) };
      if(updates.likes){
        const updateLikes = { $inc: { likes: 1 }, $set: { updatedAt: Date.now() } };
      }
      const update = { $set: { ...updates, updatedAt: Date.now() } };
      try {
        await client.connect();
        const result = await PostCollection.updateOne(query, update);
        console.log(`Updated ${result.modifiedCount} post with id: ${postId}`);
        return JSON.stringify(result);
      } catch (err) {
        console.error(err);
        return null;
      } finally {
        await client.close();
      }
    } else {
      console.log(`No post found with id: ${postId}`);
      return -1;
    }
  }

//Get the likes from a post
export async function getLikes(postId: ObjectId): Promise<any> {
    const post = await checkPostExists(postId);
    if (post) {
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
    }else{
        console.log(`No post found with id ${postId}`);
        return -1;
    }
}

//Fetch a post
export async function getPostWithAuthor(postId: ObjectId): Promise<any> {
    const post = await checkPostExists(postId);
    if (post) {
        return post;
    } else {
        const client = new MongoClient(uri);
        const query = { _id: new ObjectId(postId) };
    //const projection = { id: 1, title: 1, content: 1, author: 1, likes: 1, comments: 1 };
        try {
            await client.connect();
            const result = await PostCollection.findOne(query);
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

//Add comment to a post
export async function addCommentToPost(postId: ObjectId, comment: string, commentAuthor: string): Promise<any>{
    const client = new MongoClient(uri);
    //Grab comment from cache
    const comments = await getCommentsForPost(postId.toString());
    if(comments){
        comments.push({
            _id: new ObjectId(),
            author: commentAuthor,
            post: postId.toString(),
            content: comment,
            createdAt: new Date(),
            updatedAt: new Date(),
            likes: 0
        });
        try {
            await client.connect();
            //Add comment to the post
            const result = await PostCollection.updateOne(
                { _id: postId },
                { $set: { comments: comments } }
            );
            console.log(`Updated post with id: ${postId} with new comment`);
            return result;
        } catch (err) {
            console.error(err);
        } finally {
            await client.close();
        }
    }else{
        console.log(`comment not found for post ${postId}`);
        
    }
}