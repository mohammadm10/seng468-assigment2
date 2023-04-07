import client from "./client";

client.connect();

//Function to add a unique key and its value to cache
export async function addToCache(key: string, value: string): Promise<void> {
    try {
        client.set(key, value);
        console.log(`Added ${key} to cache with value ${value}`);
    } catch (err) {
        console.log(`Error adding key "${key}" with value "${value}" to cache`)
    }
}

//Function to get a value of a specified key
export async function getFromCache(key: string, callback: (value: string | null) => void): Promise<void> {
    try {
        const value = await client.get(key);
        callback(value);
    } catch (err) {
        console.error(`Error fetching value for key "${key}"`);
        callback(null);
    }
}

export async function addToCommentCache(postId: string, commentId: string, commentData: any): Promise<void> {
    try {
        const key = `${postId}_comments`;
        const field = commentId;
        const value = JSON.stringify(commentData);
        client.hSet(key, field, value);
    } catch (err) {
        console.error(`Error adding comment with ID "${commentId}" to cache for post "${postId}"`);
        console.error(err);
    }
}

export async function getCommentsForPost(postId: string): Promise<any> {
    try {
        const key = `${postId}_comments`;
        const comments = await client.hGetAll(key);
        const commentArray = [];
        for (const field in comments) {
            commentArray.push(JSON.parse(comments[field]));
        }
        return commentArray;
    } catch (err) {
        console.error(`Error fetching comments for post "${postId}" from cache`);
        console.error(err);
        return null;
    }
}

