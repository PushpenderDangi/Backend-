import { ApiError } from "../utils/apiError"
import { Jwt } from "jsonwebtoken"
import { User } from "../models/user.model" 

export const verifyJWT = asyncHandler(async(req,resp,next)=>{
try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decoderToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decoderToken?._id).select
        ("-password -refreshToken")
    
        if(!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next() 
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
}


})