import { DateTime } from '@elastic/elasticsearch/lib/api/types';
import { MongoClient, Collection, ObjectId } from 'mongodb';

const uri = 'mongodb://localhost:27017/mydatabase';

interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  username: string;
  dateOfBirth: DateTime;
  friends: User[];
  posts: Post[];
  comments: Comment[];
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Post {
  _id: ObjectId;
  title: string;
  content: string;
  author: String;
  likes: number;
  comments: Comment[];
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Comment {
  _id: ObjectId;
  author: String;
  post: String;
  content: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  likes: number;
}

interface Notification {
  _id: ObjectId;
  recipient: String;
  type: String;
  postId: String;
  commentId: String;
  CreatedAt: DateTime;
}


const client = new MongoClient(uri, {});

export const db = client.db('mydatabase');

export async function connect(): Promise<void> {
  await client.connect();
}

export const UserCollection: Collection<User> = db.collection('User');
export const PostCollection: Collection<Post> = db.collection('Post');
export const CommentCollection: Collection<Comment> = db.collection('Comment');
export const NotificationCollection: Collection<Notification> = db.collection('Notification');
