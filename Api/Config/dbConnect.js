import mongoose from "mongoose";

export const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URi);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
    throw err;
  }
};

