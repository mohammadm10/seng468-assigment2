import express from "express";
import { fetchUser, updateUser, insertUser, deleteUserById } from "../crud/user";
import { ObjectId } from "mongodb";

const router = express.Router();

interface Updates {
    email?: string;
    username?: string;
}

//Fetch a user
router.get('/:userId', async (req, res) =>{
    try{
        const userId = new ObjectId(req.params.userId);
        if (ObjectId.isValid(userId)) {
            const user = await fetchUser(userId);
            res.status(200).json(user);
        } else {
            console.log(`Invalid userId ${userId}`);
            res.status(400).json({ error: 'Invalid user ID' });
        }
    } catch(err) {
        err = `UserId invalid`
        console.log(err);
        res.status(400).json({ error: err });
    }
})

//Update a users username
router.put('/', async (req, res) => {
    try {
      if (!req.body.userId || !req.body.updates) {
        return res.status(400).json('Missing request body');
      }
  
      const userId = new ObjectId(req.body.userId);
      const updates: Updates = req.body.updates;
  
      if (ObjectId.isValid(userId)) {
        const updatedUser = await updateUser(userId, updates);
        res.status(200).json(updatedUser);
      } else {
        console.log(`Invalid userId ${userId}`);
        res.status(400).json({ error: 'Invalid user ID' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

//Insert new user
router.post('/', async (req, res) => {
    try {
        const name = req.body.name;
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const dateOfBirth = req.body.dateOfBirth;
        const dob = new Date(dateOfBirth);
        
        const insert = await insertUser(name, username, email, password, dob);
        res.set('Content-Type', 'application/json')
        res.status(200).json(insert);
    } catch (err) {
        err = 'Error creating a new user';
        res.status(400).json({ error: err });
    }
})

//Delete user
router.delete('/:userId', async (req, res) =>{
    try{
        const userId = new ObjectId(req.params.userId);
        if (ObjectId.isValid(userId)) {
            const remove = await deleteUserById(userId);
            res.status(200).json(remove);
        } else {
            console.log(`Invalid userId ${userId}`);
            res.status(400).json({ error: 'Invalid user ID' });
        }
    } catch(err) {
        err = `Error deleting user`
        console.log(err);
        res.status(400).json({ error: err });
    }
})

export default router;