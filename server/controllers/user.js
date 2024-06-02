import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.js";
import Novel from "../models/novel.js";
import Review from "../models/review.js";

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById({ userId }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username } = req.body;
    let { profileImg } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!username) {
      return res
        .status(400)
        .json({ error: "Required fields are not filled in" });
    }
    if (/\s/.test(username)) {
      return res.status(400).json({ error: "Username can`t contain a spaces" });
    }

    if (profileImg && profileImg != user.profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0],
          {
            resource_type: "image",
          }
        );
      }
      const uploadResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadResponse.secure_url;
    } else if (profileImg && user.profileImg) {
      await cloudinary.uploader.destroy(
        user.profileImg.split("/").pop().split(".")[0],
        {
          resource_type: "image",
        }
      );
    }

    await User.findByIdAndUpdate(userId, {
      username: username,
      profileImg: profileImg,
    });
    res.status(201).json("Ok");
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
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
    if (reviews.length === 0) {
      return res.status(404).json({ error: "Reviews not found" });
    }
    const total_reviews = await Review.find({ user: user });
    res
      .status(200)
      .json({ pageData: reviews, totalCount: total_reviews.length });
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
    if (novels.length === 0) {
      return res.status(404).json({ error: "Novels not found" });
    }
    const total_novels = await Novel.find({
      savedBy: { $elemMatch: { $eq: userId } },
    });

    res.status(200).json({ pageData: novels, totalCount: total_novels.length });
  } catch (error) {
    console.log("Error in getSaves: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
