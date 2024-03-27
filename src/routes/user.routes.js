import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
//below line is used to upload the images etc
import { upload } from "./middleware/multer.middleware.js"
import { config } from "dotenv";

const router = Router()

// This is used to inject middleware
router.route('/register').post(
    upload.fields([
        {
            name: "avatar", // this should be same in frontend also
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/referesh-token").post(refreshAccessToken)




export default router

