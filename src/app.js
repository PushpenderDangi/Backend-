import express  from "express";
import cors from 'cors'
/*
Cookie parser is used to access and set the cookies of browser from
the server, secure cookies are read by the server only
*/
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
//the below line is used because of the url data it can be %20, ? etc
app.use(express.urlencoded({extended: true})) 
/* the below line is used because to store image or pdf in our own server that are public and can be used by anyone
like favicon */
app.use(express.static("public"))
app.use(cookieParser())


// import routes

import userRouter from "./routes/user.routes.js"

//routes declaration

app.use("/api/v1/users", userRouter)


export { app }
