import dotenv from "dotenv";
import dbConnect from './db/db.js'
import express from "express";

dotenv.config();

const app = express();

dbConnect();

app.get("/", (req, res) =>{
    res.send("<h1>Hello World!</h1>");
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Listning on port : ${PORT}`); 
})