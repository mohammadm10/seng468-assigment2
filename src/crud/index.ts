import { insertUser } from "./user";

function addNewUsers(){
    const dateOfBirth = new Date('1990-01-01');
    insertUser("moe", "cache-moe10", "momo@moe.com", "password", dateOfBirth)
        .then(() => {
            console.log("User added successfully!");
        })
        .catch((error) => {
            console.error("Error adding user:", error);
        });
}

addNewUsers();