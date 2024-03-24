import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const conncetionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`MONGODB connected successfully.. DB HOST: ${conncetionInstance.connection.host}`);
    }
    catch (error) {
        console.log("MONGODB connection error ", error)
        process.exit(1) // use exit code 1 becuase of node failure 
    }
}

export default connectDB