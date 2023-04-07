import { ObjectId } from "mongodb";
import { insertUser, checkUserExists, updateUserName, updateEmail, deleteUserById, fetchAllUsers } from "./user";
import { newPost, checkPostExists, likePost, getLikes } from "./posts";
import { addComment } from "./comment";

async function fetchAllUserIds() {
    try {
      const test = await fetchAllUsers();
      const start = process.hrtime();
      if(test){
      test.forEach((user) => {
        fetchUserFromCache(user._id);
    });

    const end = process.hrtime(start)
    const elapsed = end[0] * 1000 + end[1] / 1000000;
    console.log(`Elapsed time: ${elapsed} milliseconds`);
    }
    } catch (err) {
      console.error(err);
    }
  }

 // fetchAllUserIds();

function addNewUsers(){
    const dateOfBirth = new Date('1990-01-01');
    let count = 0;
    for(count = 0; count<20; count++){
    insertUser("moe " + count.toString(), "username " + count.toString(), "momo@moe.com", "password", dateOfBirth)
        .then(() => {
            console.log("User added successfully!");
        })
        .catch((error) => {
            console.error("Error adding user:", error);
        });
        count++;
    }
}

//addNewUsers();

async function fetchUserFromCache(userId: ObjectId){
    const user = await checkUserExists(userId);
    if(user){
        console.log(user);
    }else{
        console.log("Error fetching user from cache");
    }
}

async function updateUserNameTest(){
    const id = new ObjectId("643077edb3d66448ec1a77ac");
    const newName = "johnnyUpdated";
    const test = await updateUserName(id, newName);
    if(test){
        console.log("User name update!");
    }else{
        console.log("Error");
        
    }
}

// updateUserNameTest();

async function deleteUserTest() {
    const id = new ObjectId("643077edb3d66448ec1a77ac");
    const test = await deleteUserById(id);
    if(test){
        console.log(`User ${id} deleted`);
        
    }
}

// deleteUserTest();

async function insertNewPost() {
    const title = "The Art of War";
    const content = "The supreme art of war is to subdue the enemy without fighting.";
    const author = "Sun Tzu";

    const post = await newPost(author, title, content);
}

// insertNewPost();

async function fetchPost(){
    const id = new ObjectId("64307c0752f4644d6524e769");
    const post = await checkPostExists(id);
    if(post){
        console.log(post);
        
    }
}

// fetchPost();

async function testLikePost() {
    const id = new ObjectId("64307c0752f4644d6524e769");
    await likePost(id);
}

//testLikePost();

async function getLikesTest(){
    const id = new ObjectId("64307c0752f4644d6524e769");
    const likes = await getLikes(id);
    console.log(likes);
    
}

//getLikesTest();

async function addCommentTest() {
    const id = new ObjectId('64307c0752f4644d6524e769');
    const comment = "This is another comment";
    const commentAuthor = "Moe";
    const newComment = await addComment(id, comment, commentAuthor);
}

//addCommentTest();