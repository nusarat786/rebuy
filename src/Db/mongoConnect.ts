import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const url: string = process.env.DB_URL || ""; 

const dbConnect = (): Promise<typeof mongoose> => {
    return mongoose
        .connect(url)
        .then((con) => {
            console.log("MongoDB is connected");
            return con;
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
            throw err;
        });
};

export default dbConnect;