import express from "express";
const AuthRouter = express.Router();
import auth from "../../middleware/auth.js";
import User from "../../models/User.js";
import { check, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "config";
//@route GET api/auth
//@desc Get user details except password for displaying on profile page
//@acess Public
AuthRouter.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route POST api/auth
//@desc Authenticate & verify User
//@acess Public

AuthRouter.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //Destructing req.body to avoid repetition
    const { email, password } = req.body;
    try {
      //Check for existing User
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });

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

export default AuthRouter;
