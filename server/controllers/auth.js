import bcrypt from "bcryptjs";
import { body } from "express-validator";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!body("email").isEmail) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const userExist = await User.findOne({ username });
    if (userExist) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }
    if (username.length < 5) {
      return res
        .status(400)
        .json({ error: "Username must be at least 5 characters long" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isModerator: newUser.isModerator,
        profileImg: newUser.profileImg,
        about: newUser.about,
        likedReview: newUser.likedReview,
        disLikedReview: newUser.disLikedReview,
        comments: newUser.comments,
        saves: newUser.saves,
        followedNovels: newUser.followedNovels,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
    return res.status(200).json();
  } catch (error) {
    console.log("Error in : ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isModerator: user.isModerator,
      profileImg: user.profileImg,
      about: user.about,
      likedReview: user.likedReview,
      disLikedReview: user.disLikedReview,
      comments: user.comments,
      saves: user.saves,
      followedNovels: user.followedNovels,
    });
  } catch (error) {
    console.log("Error in : ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in : ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAuthUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in : ", error.message);
    res.status(500).json({ error: error.message });
  }
};
