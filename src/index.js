import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is listening on ${process.env.PORT}`);
    } )
})
.catch ((err) => {
    console.log("MongoDb connection failed", err);
}) 






/*

import mongoose  from "mongoose";
import express from "express"
const app = express()

import {DB_NAME} from "./constants"

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("ERROR: ", error);
            throw error
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on ${process.env.PORT}`);
        })
    }
    catch (error){
        console.error("ERROR: ", error)
    }

})()

*/