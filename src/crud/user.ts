import { MongoClient, Collection, ObjectId } from 'mongodb';
import { UserCollection } from '../database/schema';

const uri = 'mongodb://localhost:27017/mydatabase';

//Function to insert a new user
export async function insertUser(
    name: string,
    username: string,
    email: string,
    password: string,
    dateOfBirth: Date
): Promise<void> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const newUser: any = {
            id: new ObjectId(),
            name,
            username,
            email,
            password,
            dateOfBirth,
            friends: [],
            posts: [],
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await UserCollection.insertOne(newUser);
        console.log(`Inserted user with id: ${result.insertedId}`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

//Function to fetch a user based off of their userId
export async function fetchUser(userId: string): Promise<any | null> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const user = await UserCollection.findOne({ _id: new ObjectId(userId) });
        return user;
    } catch (err) {
        console.error(err);
        return null;
    } finally {
        await client.close();
    }
}

//Function to update a user username given their id
export async function updateUserName(userId: string, newName: string): Promise<any | null> {
    const query = { _id: new ObjectId(userId) };
    const update = { $set: { name: newName, updatedAt: Date.now() } };
    try {
        const result = await UserCollection.updateOne(query, update);
        console.log(`Updated ${result.modifiedCount} user with id: ${userId}`);
        return result;
    } catch (err) {
        console.error(err);
        return null;
    }
}

//Function to update a user email given their id
export async function updateEmail(userId: string, newEmail: string): Promise<any | null> {
    const query = { _id: new ObjectId(userId) };
    const update = { $set: { email: newEmail, updatedAt: Date.now() } };
    try {
        const result = await UserCollection.updateOne(query, update);
        console.log(`Updated ${result.modifiedCount} user with id: ${userId}`);
        return result;
    } catch (err) {
        console.error(err);
        return null;
    }
}

//Function to delete a user by userId
export async function deleteUserById(userId: string): Promise<boolean> {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const result = await UserCollection.deleteOne({ _id: new ObjectId(userId) });
    return result.deletedCount === 1;
  } catch (err) {
    console.error(err);
    return false;
  } finally {
    await client.close();
  }
}
