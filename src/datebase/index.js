import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const db = await mongoose.connect(`${process.env.MONGO_URL}/${process.env.DB_NAME}`);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error ", error);
    throw error;
  }
};

export default connectDB;
