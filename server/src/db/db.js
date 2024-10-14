import mongoose from "mongoose";
import { DB_NAME } from "../content.js";

const dbConnect = async () =>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       
        console.log("Database connection succesfull")   

    } catch (error) {
        console.log("Error : ", error);
        throw error;
    }
}

export default dbConnect;