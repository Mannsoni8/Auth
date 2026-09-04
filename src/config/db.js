import mongoose from "mongoose";
import config from "./config.js";

export const connectDB = async()=>{
    try {
        await mongoose.connect(config.MONGO_URI)
        console.log("Database is connected")
    } catch (error) {
        console.log("Error in connencting  data base",error)
    }
}