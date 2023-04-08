import express from "express";
import { ObjectId } from "mongodb";
import { newPost, getPostWithAuthor, updatePost, likePost, deletePostById, addCommentToPost } from "../crud/posts";

const router = express.Router();

interface Updates {
    title?: string;
    content?: string;
}

//Insert new post
router.post('/', async (req, res) => {
    try {
        const author = req.body.author;
        const title = req.body.title;
        const content = req.body.content;
        res.set('Content-Type', 'application/json')
        const insert = await newPost(author, title, content);
        return res.status(200).json(insert);
    } catch (err) {
        err = 'Error creating a new post';
        return res.status(400).json({ error: err });
    }
});

//Fetch a post
router.get('/:postId', async (req, res) => {
    try {
        const postId = new ObjectId(req.params.postId);
        if (ObjectId.isValid(postId)) {
            const post = await getPostWithAuthor(postId);
            return res.status(200).json(post);
        } else {
            console.log(`Invalid postId ${postId}`);
            return res.status(400).json({ error: 'Invalid post ID' });
        }
    } catch (err) {
        err = `Invalid postId`
        console.log(err);
        return res.status(400).json({ error: err });
    }
})

//Update a post (Likes, title, content)
router.put('/', async (req, res) => {
    try {
        if (!req.body.postId) {
            return res.status(400).json('Missing request body');
        } else if (!req.body.update) {
            const postId = new ObjectId(req.body.postId);

            if (ObjectId.isValid(postId)) {
                const updatedLikes = await likePost(postId);
                return res.status(200).json(updatedLikes);
            } else {
                console.log(`Invalid postId ${postId}`);
                return res.status(400).json({ error: 'Invalid user ID' });
            }
        }

        const postId = new ObjectId(req.body.postId);
        const updates: Updates = req.body.updates;

        if (ObjectId.isValid(postId)) {
            const updatedUser = await updatePost(postId, updates);
            return res.status(200).json(updatedUser);
        } else {
            console.log(`Invalid postId ${postId}`);
            return res.status(400).json({ error: 'Invalid user ID' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

//Delete post
router.delete('/:postId', async (req, res) => {
    try {
        const postId = new ObjectId(req.params.postId);
        if (ObjectId.isValid(postId)) {
            const remove = await deletePostById(postId);
            return res.status(200).json(remove);
        } else {
            console.log(`Invalid postId ${postId}`);
            return res.status(400).json({ error: 'Invalid post ID' });
        }
    } catch (err) {
        err = `Error deleting post`
        console.log(err);
        return res.status(400).json({ error: err });
    }
})

router.get('/:postId/:comment/:commentAuthor', async (req, res) =>{
    try {
        const postId = new ObjectId(req.params.postId);
        if (ObjectId.isValid(postId)) {
            const comment = await addCommentToPost(postId, req.params.comment, req.params.commentAuthor);
            return res.status(200).json(comment);
        } else {
            console.log(`Invalid postId ${postId}`);
            return res.status(400).json({ error: 'Invalid post ID' });
        }
    } catch (err) {
        err = `Error adding comment to post ${req.params.postId}`
        console.log(err);
        return res.status(400).json({ error: err });
    }
})

export default router;