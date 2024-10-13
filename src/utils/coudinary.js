import { v2 as cloudinary } from "cloudinary";
import fs from "fs"


cloudinary.config({ 
    cloud_name: 'doxoe6asd', 
    api_key: '741894233781248', 
    api_secret: '0s7Auz6WYsH2TWdUAps-JQeJ-qw' // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localfilepath) => {
    try {
        if(!localfilepath) return null;

        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        });

        // console.log("File uploaded successfull", response.url);

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