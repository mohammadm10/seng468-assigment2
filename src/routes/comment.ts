import express from "express";
import { ObjectId } from "mongodb";
import { addComment, getComments, likeComment, updateComment } from "../crud/comment";

const router = express.Router();

interface Updates {
    likes?: number;
    content?: string;
}

//Insert new comment
router.post('/', async (req, res) => {
    try {
        const postId = req.body.postId;
        const comment = req.body.comment;
        const commentAuthor = req.body.commentAuthor;
        res.set('Content-Type', 'application/json')
        const insert = await addComment(postId, comment, commentAuthor);
        return res.status(200).json(insert);
    } catch (err) {
        err = 'Error creating a new comment';
        return res.status(400).json({ error: err });
    }
});

//Fetch comments
router.get('/:postId', async (req, res) => {
    try{
        console.log('here');
        
        const postId = new ObjectId(req.params.postId);
        if (ObjectId.isValid(postId)) {
            const comments = await getComments(postId);
            return res.status(200).json(comments);
        } else {
            console.log(`Invalid postId ${postId}`);
            return res.status(400).json({ error: 'Invalid post ID' });
        }
    }catch(err){
        err = 'Error fetching comment from post'
        return res.status(400).json({ error: err });
    }
})

//Update a comment (Likes, content)
router.put('/', async (req, res) => {
    try {
        if (!req.body.commentId) {
            return res.status(400).json('Missing request body');
        } else if (!req.body.update) {
            const commentId = new ObjectId(req.body.commentId);

            if (ObjectId.isValid(commentId)) {
                const updatedLikes = await likeComment(commentId);
            } else {
                console.log(`Invalid commentId ${commentId}`);
            }
        }

        const commentId = new ObjectId(req.body.commentId);
        const updates: Updates = req.body.updates;

        if (ObjectId.isValid(commentId)) {
            const updatedUser = await updateComment(commentId, updates);
            return res.status(200).json(updatedUser);
        } else {
            console.log(`Invalid postId ${commentId}`);
            return res.status(400).json({ error: 'Invalid user ID' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

export default router;