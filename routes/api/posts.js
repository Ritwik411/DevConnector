import express from "express";
import { check, validationResult } from "express-validator";
import auth from "../../middleware/auth.js";
import PostSchema from "../../models/Post.js";
import ProfileSchema from "../../models/Profile.js";
import UserSchema from "../../models/User.js";

const PostsRouter = express.Router();

//@route POST api/posts
//@desc Create a post
//@acess Private

PostsRouter.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await UserSchema.findById(req.user.id).select("-password");
      const newPost = new PostSchema({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route GET api/posts
//@desc GET a post
//@acess Private

PostsRouter.get("/", auth, async (req, res) => {
  try {
    const post = await PostSchema.find().sort({ date: -1 });
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route GET api/posts/id
//@desc GET post by id
//@acess Private

PostsRouter.get("/:id", auth, async (req, res) => {
  try {
    const post = await PostSchema.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post Not Found" });
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId")
      return res.status(404).json({ msg: "Post Not Found" });

    res.status(500).send("Server Error");
  }
});

//@route DELETE api/posts/id
//@desc Delete posts by id
//@acess Private

PostsRouter.delete("/:id", auth, async (req, res) => {
  try {
    const post = await PostSchema.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post Not Found" });
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not Authorized" });
    }
    await post.remove();
    res.json({ msg: "Post Deleted" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId")
      return res.status(404).json({ msg: "Post Not Found" });

    res.status(500).send("Server Error");
  }
});

//@route PUT api/posts/like/id
//@desc Like a post
//@acess Private

PostsRouter.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await PostSchema.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    )
      return res.status(400).json({ msg: "Post already liked" });

    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route PUT api/posts/like/id
//@desc Unlike a post
//@acess Private

PostsRouter.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await PostSchema.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    )
      return res.status(400).json({ msg: "Post not liked yet" });

    //Get Remove Index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route POST api/posts/comment/:id
//@desc Comment a post
//@acess Private

PostsRouter.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await UserSchema.findById(req.user.id).select("-password");
      const post = await PostSchema.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route delete api/posts/comment/:id/:comment_id
//@desc Delete a comment
//@acess Private

PostsRouter.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await PostSchema.findById(req.params.id);
    //Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //Check if comment exists
    if (!comment)
      return res.status(400).json({ msg: "Comment does not exist" });

    //Ensure user deletes' his commnet only
    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Unauthorized" });

    const removeIndex = post.comments
      .map((comment) => comment.id.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
export default PostsRouter;
