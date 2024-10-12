import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API ,
    api_secret: process.env.CLOUDINARY_API_SECRET 
})

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if(!localfilepath) return null;

        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        });

        console.log("File uploaded successfull", response.url);

        return response;
    }
    catch(error){
        fs.unlink(localfilepath, ()=>{
            console.log("Error in uploading file on cloudinary");
        })

        return null;
    }
}

export {uploadOnCloudinary};