import mongoose from "mongoose";
import config from "config";
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    console.log(db);
    await mongoose.connect(db, {});
    console.log("MongoDB connected!");
  } catch (e) {
    console.log(e);
    //Exits process with failure
    process.exit(1);
  }
};

export default connectDB;
