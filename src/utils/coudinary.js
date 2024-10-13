import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

import dotenv from "dotenv";
dotenv.config({
    path:'./.env'
})


cloudinary.config({ 
    cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`, 
    api_key: `${process.env.CLOUDINARY_API_KEY}`, 
    api_secret: `${process.env.CLOUDINARY_API_SECRET}` 
});

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if(!localfilepath) return null;

        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        });

        // console.log("File uploaded successfull", response.url);
        fs.unlinkSync(localfilepath);

        return response;
    }
    catch(error){
        fs.unlink(localfilepath, ()=>{
            console.log("Error in uploading file on cloudinary");
        })
        // console.log(localfilepath);

        return null;
    }
}

export {uploadOnCloudinary};