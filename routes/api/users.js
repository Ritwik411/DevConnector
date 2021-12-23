import express from "express";
import { check, validationResult } from "express-validator";
const UserRouter = express.Router();
import UserSchema from "../../models/User.js";
import gravatar from "gravatar";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "config";
//Fetching the model here
const User = UserSchema;
//@route GET api/users
//@desc Register User
//@acess Public

UserRouter.post(
  "/",
  [
    check("name", "Name is Required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a 6 or more character password!").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //Destructing req.body to avoid repetition
    const { name, email, password } = req.body;
    try {
      //Check for existing User
      let user = await User.findOne({ email });
      if (user) {
        res.status(400).send({ errors: [{ msg: "User Already Exists" }] });
      }
      const avatar = gravatar.url({
        s: "200",
        r: "pg",
        d: "mm",
      });
      //Create New User
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      //Encrypt the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();
      //Send back the JSon Web Token
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtToken"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (e) {
      console.log(e.message);
      res.status(500).send("Server Error");
    }
  }
);

export default UserRouter;
