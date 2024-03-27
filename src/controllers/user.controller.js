import { asyncHandler } from "../utils/asyncHandler";
import { ApiError, apiError } from "../utils/apiError.js"
import { User } from "./models/user.model.js"
import { uploadOncloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"; 
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefereshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}


    } catch (error) {
        throw new apiError(501, "Something went wrong while generating referesh and access tokens")
    }
}

const registerUser = asyncHandler( async (req,resp) => {
    // get user details from frontend
    // validation fields sent empty
    // check if user already exists: username or email
    // check for images, check for avatar
    // upload them to cloudnary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    // get user details from frontend
    const {fullname, email, username, password} = req.body

    // validation fields sent empty
    if (
        [fullname, email, username, password].some((field) =>
        field?.trim() === "") //field hai to trim krdo or trim krne ke bad bhi empty hai to automatically true return krdo
    ){
        throw new apiError(400, "All fields are required")
    }

    // check if user already exists: username or email
    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    if (existedUser) {
        throw new apiError(409, "User with username and email already existed")
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }

    // upload them to cloudnary, avatar
    const avatar = await uploadOncloudinary(avatarLocalPath)
    const coverImage = await uploadOncloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new apiError(400, "Avatar file is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const userCreated =  await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!userCreated) {
        throw new apiError(500, "Something went wrong while registering the user")
    }

    return resp.status(201).json(
        new ApiResponse(200, userCreated, "User is created Successfully")
    )



    // resp.status(200).json({
    //     message: "OK"
    // })

})

const loginUser = asyncHandler(async (req,resp) =>{
    // req body --> data
    // username or email base login access
    // find the user username or email coming in the request body or not
    // find the user present or not
    // check password
    // access and refresh token
    // send cookie

    // req body --> data
    const {email, username, password} = req.body

    // username or email base login access
    if(!username || !email) {
        throw new apiError(400, "username or password is required")
    }

    // find the user using username or email coming in the request body whether the user exist or not
    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if(!user) {
        throw new apiError(404, "User does not exist")
    }

    // check password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(401, "Incorrect Password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // send cookie ... what information have to sent to user
    const options = {
        httpOnly: true,
        secure: true
    }

    return resp          //key         //value
    .status(200).cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, resp)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return resp.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out Successfully"))
})

const refreshAccessToken = asyncHandler(async(req,resp)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return resp
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, newrefreshToken}
            )
        )
    
    } catch (error) {
        throw new ApiError(401, "error?.message" || "invalid referesh token")
        
    }
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}