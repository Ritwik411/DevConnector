import express from "express";
import connectDB from "./config/db";
const app = express();

//Connect to DB
connectDB();

app.get("/", (req, res) => {
  res.send("API Running'");
});

const PORT = process.env.port || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
