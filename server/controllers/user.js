import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.js";
import Novel from "../models/novel.js";
import Review from "../models/review.js";

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword, about } = req.body;
    let { profileImg } = req.body;

    const userId = req.user._id;
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ error: "Password must be at least 8 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    user.email = email || user.email;
    user.username = username || user.username;
    user.about = about || user.about;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;

    user = await user.save();

    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const users = await User.find({}, null, {
      skip: page * limit,
      limit: limit,
    });
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in : ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getUserByReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const user = await User.findById(review.user).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserByReview: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const reviews = await Review.find({ user: user }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.log("Error in getReviews: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSaves = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const novels = await Novel.find(
      {
        savedBy: { $elemMatch: { $eq: userId } },
      },
      null,
      {
        skip: page * limit,
        limit: limit,
      }
    );
    res.status(200).json(novels);
  } catch (error) {
    console.log("Error in getReviews: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
