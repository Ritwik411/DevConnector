import express from "express";
import connectDB from "./config/db.js";
import AuthRouter from "./routes/api/auth.js";
import UserRouter from "./routes/api/users.js";
import ProfileRouter from "./routes/api/profile.js";
import PostsRouter from "./routes/api/posts.js";
const app = express();

//Connect to DB
connectDB();

app.get("/", (req, res) => {
  res.send("API Running'");
});
app.use(express.json({ extended: false }));
app.use("/api/auth", AuthRouter);
app.use("/api/users", UserRouter);
app.use("/api/posts", PostsRouter);
app.use("/api/profile", ProfileRouter);

const PORT = process.env.port || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
