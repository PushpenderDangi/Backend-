import { asyncHandler } from "../utils/asyncHandler";
import { apiError } from "../utils/apiError.js"
import { User } from "./models/user.model.js"
import { uploadOncloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"; 

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

export {registerUser}