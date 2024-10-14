import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req,res, next) =>{
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ", "");
        
        if(!token){
            throw new ApiError(401, "Token not found");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );
    
        if(!user){
            throw new ApiError(401, "Invalid access token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(401, "Invalid token");
        } else if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, "Token has expired");
        } else {
            throw new ApiError(500, error?.message || "Internal server error");
        }
    }
});