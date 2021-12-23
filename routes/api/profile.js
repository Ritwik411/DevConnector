import express from "express";
const ProfileRouter = express.Router();
import auth from "../../middleware/auth.js";
import ProfileSchema from "../../models/Profile.js";
import UserSchema from "../../models/User.js";
import { check, validationResult } from "express-validator";
const Profile = ProfileSchema;
const User = UserSchema;

//@route GET api/profile/me
//@desc Get Current Users profile
//@acess Private
ProfileRouter.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route POST api/profile
//@desc Create/Update User Profile
//@acess Private

ProfileRouter.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // destructure the request
    const {
      company,
      status,
      skills,
      location,
      bio,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      website,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills)
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        console.log("Profile already exists");
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }
      // if profile is not present, create one
      console.log("Profile is new");
      profile = new Profile(profileFields);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route GET api/profile
//@desc GET all Profiles
//@acess Public

ProfileRouter.get("/", async (req, res) => {
  try {
    const profile = await Profile.find().populate("user", ["name", "avatar"]);
    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route GET api/profile/user/:user_id
//@desc GET all Profile by user id
//@acess Public

ProfileRouter.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not found!" });
    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId")
      return res.status(400).json({ msg: "Profile not found!" });
    res.status(500).send("Server Error");
  }
});

//@route DELETE api/profile
//@desc Delete profile,user & posts
//@acess Private

ProfileRouter.delete("/", auth, async (req, res) => {
  try {
    //@todo Remove users posts

    //Delete User Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Delete User
    await User.findOneAndRemove({ _id: req.user.id });

    return res.json({ msg: "User Deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route PUT api/profile/education
//@desc Add profile education
//@acess Private
ProfileRouter.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("from", "Starting Date is required").not().isEmpty(),
      check("fieldofstudy", "Field of Study is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      res.status(400).json({ errors: error.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    const newExp = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      //Adds entry to the beginneing so most recent is first
      profile.education.unshift(newExp);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

//@route Delete api/profile/education
//@desc Delete profile experince
//@acess Private
ProfileRouter.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//@route PUT api/profile/experience
//@desc Add profile experince
//@acess Private
ProfileRouter.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "Starting Date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      res.status(400).json({ errors: error.array() });
    }

    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      //Adds entry to the beginneing so most recent is first
      profile.experience.unshift(newExp);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

//@route Delete api/profile/experience
//@desc Delete profile experince
//@acess Private
ProfileRouter.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

export default ProfileRouter;
