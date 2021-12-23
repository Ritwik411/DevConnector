import express from "express";
const PostsRouter = express.Router();

//@route GET api/posts
//@desc Test route
//@acess Public
PostsRouter.get("/", (req, res) => {
  res.send("Posts Router");
});
export default PostsRouter;
