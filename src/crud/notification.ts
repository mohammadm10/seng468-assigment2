import { MongoClient, ObjectId } from 'mongodb';
import { NotificationCollection } from '../database/schema';

const uri = 'mongodb://localhost:27017/mydatabase';

//Send Notif
export async function sendNotification(
    recipient: String,
    type: String,
    postId: String,
    commentId: String
): Promise<any | null> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const newNotif: any = {
            id: new ObjectId(),
            recipient: recipient,
            post: postId,
            type: type,
            commentId: commentId,
            updatedAt: new Date(),
        };
        const result = await NotificationCollection.insertOne(newNotif);
        console.log(`New notification to: ${recipient}`);
        console.log(result);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}