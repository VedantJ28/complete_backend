import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/coudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler (async (req,res) =>{
    // Get user details from frontend
    // Validation of data - empty or not
    // Check if user already exist - username , email
    // Check for file(images) - avatar
    // Upload on cloudinary
    // validate response by cloudinary and multer
    // create user object - entry in db
    // remove password and refresh token from response
    // check for user successfull creation
    // return response

    const {username, email, fullName, password} = req.body;


    if(!username || !email || !fullName || !password){
        throw new ApiError(400, "All fields are required");
    }

    if(password.length < 6){
        throw new ApiError(400, "Password should be atleast 6 characters long");
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if(!emailRegex.test(email)){
        throw new ApiError(400, "Invalid email format");
    }

    const userExist = await User.findOne({$or: [{email}, {username}]});

    if(userExist){
        throw new ApiError(400, "User already exist with this email or username");
    }

    const avatarLoacalPath = req.files?.avatar[0]?.path;
    const coverImageLoaclPath = req.files?.coverImage[0]?.path;

    if(!avatarLoacalPath){
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLoacalPath);
    const coverImage = await uploadOnCloudinary(coverImageLoaclPath);

    if(!avatar){
        throw new ApiError(400, "Avatar is required");
    }
    
    const user = await User.create({
        username: username.toLowerCase() , 
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating user");
    }

    return res.send(200).json(
        new ApiResponse(201, createdUser, "User registered successfully");
    )
    
});

export {registerUser};