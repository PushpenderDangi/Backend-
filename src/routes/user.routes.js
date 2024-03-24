import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
//below line is used to upload the images etc
import { upload } from "./middleware/multer.middleware.js"

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

export default router