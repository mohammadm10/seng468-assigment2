import { MongoClient, ObjectId } from 'mongodb';
import { UserCollection } from '../database/schema';
import { addToCache, getFromCache } from '../redis/caching';

const uri = 'mongodb://localhost:27017';
export async function fetchAllUsers() {
    const client = new MongoClient(uri);
    try {
      const users = await UserCollection.find().toArray();
      return users;
    } catch (err) {
      console.error(err);
    } finally {
      await client.close();
    }
  }

//Function to insert a new user
export async function insertUser(
    name: string,
    username: string,
    email: string,
    password: string,
    dateOfBirth: Date
): Promise<void> {
    const client = new MongoClient(uri);
    const _id = new ObjectId();
    try {
        await client.connect();
        const newUser: any = {
            _id,
            name,
            email,
            password,
            username,
            dateOfBirth,
            friends: [],
            posts: [],
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await UserCollection.insertOne(newUser);
        console.log(`Inserted user with id: ${result.insertedId}`);
        //Add user data to cache
        await addToCache(_id.toString(), JSON.stringify(newUser));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

//Get user from cache
export async function getUserCache(userId: ObjectId): Promise<any> {
    return new Promise((resolve, reject) => {
        getFromCache(userId.toString(), (val) => {
            if (val != null) {                                
                resolve(JSON.parse(val));
            } else {
                resolve(null);
            }
        });
    });
}


//Check if a user exists
export async function checkUserExists(userId: ObjectId): Promise<any> {
    //Try to fetch user from the cache first
    
    const user = await getUserCache(userId);
    if (user) {
        
        //User found in cache
        return JSON.stringify(user);
    } else {
        console.log("not found in cache");
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
}

//Function to fetch a user based off of their userId
export async function fetchUser(userId: ObjectId): Promise<any> {
    const user = await checkUserExists(userId);
    if (user) {
        return user;
    } else {
        console.log(`No user found with id: ${userId}`);
        return -1;
    }
}

//Function to update a user username given their id
export async function updateUserName(userId: ObjectId, newName: string): Promise<any> {
    const user = await checkUserExists(userId);
    if (user) {
        const client = new MongoClient(uri);
        const query = { _id: new ObjectId(userId) };
        const update = { $set: { username: newName, updatedAt: Date.now() } };
        try {
            await client.connect();
            const result = await UserCollection.updateOne(query, update);
            console.log(`Updated ${result.modifiedCount} user with id: ${userId}`);
            return JSON.stringify(result);
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            await client.close();
        }
    } else {
        console.log(`No user found with id: ${userId}`);
        return -1;
    }
}

//Function to update a user email given their id
export async function updateEmail(userId: ObjectId, newEmail: string): Promise<any> {
    const user = await checkUserExists(userId);
    if (user) {
        const client = new MongoClient(uri);
        const query = { _id: new ObjectId(userId) };
        const update = { $set: { email: newEmail, updatedAt: Date.now() } };
        try {
            await client.connect();
            const result = await UserCollection.updateOne(query, update);
            console.log(`Updated ${result.modifiedCount} user with id: ${userId}`);
            return JSON.stringify(result);
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            await client.close();
        }
    } else {
        console.log(`No user found with id: ${userId}`);
        return -1;
    }

}

//Function to delete a user by userId
export async function deleteUserById(userId: ObjectId): Promise<boolean> {
    const user = await checkUserExists(userId);
    if (user) {
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
    } else {
        console.log(`No user found with id: ${userId}`);
        return false;
    }
}

//Add friend
export async function addFriend(userId: ObjectId, newFriend: ObjectId): Promise<any>{
    const user = await checkUserExists(userId);
    const friend = await checkUserExists(newFriend);
    if(user && friend){
        // Add friend to user's friends array
        const updatedUser = await UserCollection.findOneAndUpdate(
            { _id: userId },
            { $addToSet: { friends: friend } }
        );

        // Add user to friend's friends array
        const updatedFriend = await UserCollection.findOneAndUpdate(
            { _id: newFriend },
            { $addToSet: { friends: user } }
        );

        return {
            user: updatedUser,
            friend: updatedFriend
        };
    } else {
        console.log('User or friend does not exist');
        return -1;
    }
}