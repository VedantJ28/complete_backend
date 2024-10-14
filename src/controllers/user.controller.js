import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/coudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const genrateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generatin accessToken and refreshToken");
    }
}

const registerUser = asyncHandler(async (req, res) => {
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
    console.log(req.body);

    const { username, email, fullName, password } = req.body;

    if (!username || !email || !fullName || !password) {
        throw new ApiError(400, "All fields are required");
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password should be atleast 6 characters long");
    }

    const userExist = await User.findOne({ $or: [{ email }, { username }] });

    if (userExist) {
        throw new ApiError(400, "User already exist with this email or username");
    }

    const avatarLoacalPath = req.files?.avatar[0]?.path;
    // const coverImageLoaclPath = req.files?.coverImage[0]?.path;

    let coverImageLoaclPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLoaclPath = req.files.coverImage[0].path;
    }

    if (!avatarLoacalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLoacalPath);
    const coverImage = await uploadOnCloudinary(coverImageLoaclPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar not uploaded");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"));

});

const loginUser = asyncHandler( async (req, res) => {
    // Get credentials from frontend
    // Validate credentials
    // Compare credentials with database
    // Generate access token and refresh token 
    // save refresh token to database
    // send response in cookies

    // console.log(req.body);

    const {email, password} = req.body
    // console.log(email);


    if (!(email)) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({email});

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isValidPassword = await user.isValidPassword(password);

    if (!isValidPassword) {
        throw new ApiError(400, "Incorrect credentials");
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly : true,
        secure : true
    }

    res.
    status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    );
});

const logoutUser = asyncHandler(async (req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    res.
    status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User Logged Out")
    );

});

const accessTokenRefresh = asyncHandler(async (req, res) =>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(400, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(400, "Invalid token");
        }
    
        if(decodedToken != user?.refreshToken){
            throw new ApiError(400, "Token expired");
        }
    
        const {accessToken, newRefreshToken} = await genrateAccessAndRefreshToken(decodedToken._id);
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, refreshToken: newRefreshToken
                },
                "Access token refreshed"
            )
        );
    } catch (error) {
        throw new ApiError(
            400,error?.message || "Error while refreshing access token"
        )
    } 
});

const changeCurrentPassword = asyncHandler(async (req, res) => {    
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "Password should be atleast 6 characters long");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isValidPassword = await user.isValidPassword(currentPassword);

    if (!isValidPassword) {
        throw new ApiError(400, "Incorrect current password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    res.
    status(200).
    json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

const getCurrentUser = asyncHandler(async (req, res) =>{
    res.
    status(200)
    .json(
        new ApiResponse(200, req.user, "User fetched successfully")
    )
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { username, email, fullName } = req.body;

    if (!username || !email || !fullName) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    user.username = username;
    user.email = email;
    user.fullName = fullName;
    await user.save({ validateBeforeSave: false });

    res.
    status(200)
    .json(
        new ApiResponse(200, {}, "Account details updated successfully")
    );
});

export { 
    registerUser,
    loginUser,
    logoutUser,
    accessTokenRefresh,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails
};