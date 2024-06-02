import User from "../models/user.js";
import Novel from "../models/novel.js";
import Genre from "../models/genre.js";
import Review from "../models/review.js";
import Chapter from "../models/chapter.js";

import { v2 as cloudinary } from "cloudinary";

export const createNovel = async (req, res) => {
  try {
    const { title, description, status, year, author, genres } = req.body;
    let { coverImg } = req.body;

    if (
      !(title && description && status && year && author && genres.length !== 0)
    ) {
      return res
        .status(400)
        .json({ error: "Required fields are not filled in" });
    }
    if (coverImg) {
      const uploadResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadResponse.secure_url;
    }
    for (const genreId of genres) {
      const find = await Genre.findById(genreId);
      if (!find) {
        return res.status(404).json({ error: "Genre not found" });
      }
    }
    const newNovel = new Novel({
      title: title,
      description: description,
      status: status,
      year: year,
      genres: genres,
      author: author,
      coverImg: coverImg,
    });
    await newNovel.save();
    res.status(201).json(newNovel);
  } catch (error) {
    console.log("Error in createNovel: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateNovel = async (req, res) => {
  try {
    const novelId = req.params.id;
    const { title, description, status, year, author, genres } = req.body;
    let { coverImg } = req.body;
    const novel = await Novel.findById(novelId);
    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }

    if (
      !(title && description && status && year && author && genres.length !== 0)
    ) {
      return res
        .status(400)
        .json({ error: "Required fields are not filled in" });
    }

    if (coverImg && coverImg != novel.coverImg) {
      if (novel.coverImg) {
        await cloudinary.uploader.destroy(
          novel.coverImg.split("/").pop().split(".")[0],
          {
            resource_type: "image",
          }
        );
      }
      const uploadResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadResponse.secure_url;
    } else if (coverImg && novel.coverImg) {
      await cloudinary.uploader.destroy(
        novel.coverImg.split("/").pop().split(".")[0],
        {
          resource_type: "image",
        }
      );
    }

    for (const genreId of genres) {
      const find = await Genre.findById(genreId);
      if (!find) {
        return res.status(404).json({ error: "Genre not found" });
      }
    }

    await Novel.findByIdAndUpdate(novelId, {
      title: title,
      description: description,
      status: status,
      year: year,
      genres: genres,
      author: author,
      coverImg: coverImg,
    });
    res.status(201).json("Ok");
  } catch (error) {
    console.log("Error in updateNovel: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const reviewOnNovel = async (req, res) => {
  try {
    const { userId, text } = req.body;
    const novelId = req.params.id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }
    const novel = await Novel.findById(novelId);
    const user = await User.findById(userId);

    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const review = new Review({ user: userId, novel: novel, body: text });

    novel.reviews.push(review);
    user.reviews.push(review);
    await review.save();
    await novel.save();
    await user.save();

    res.status(200);
  } catch (error) {
    console.log("Error in reviewOnNovel: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAll = async (req, res) => {
  try {
    const novels = await Novel.find();
    if (novels.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(novels);
  } catch (error) {
    console.log("Error in getAll: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getNovels = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const novels = await Novel.find({}, null, {
      skip: page * limit,
      limit: limit,
    });
    if (novels.length === 0) {
      return res.status(200).json(0);
    }
    const total_novels = await Novel.find();
    res.status(200).json({ pageData: novels, totalCount: total_novels.length });
  } catch (error) {
    console.log("Error in : ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getNovel = async (req, res) => {
  try {
    const novelId = req.params.id;
    const novel = await Novel.findById(novelId);
    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }
    res.status(200).json(novel);
  } catch (error) {
    console.log("Error in getNovel: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const addViewCount = async (req, res) => {
  try {
    const novelId = req.params.id;
    const novel = await Novel.findById(novelId);
    novel.viewsCount += 1;
    await novel.save();
    res.status(200).json(novel);
  } catch (error) {
    console.log("Error in addViewCountNovel: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const addStarRating = async (req, res) => {
  try {
    const novelId = req.params.id;
    const userId = req.user._id;
    const { rating } = req.body;
    const novel = await Novel.findById(novelId);
    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }
    const userStarRatingExist = novel.starRating.find(
      (obj) => obj.user.toString() === userId.toString()
    );
    if (userStarRatingExist) {
      await Novel.updateOne(
        { _id: novelId, "starRating.user": userId },
        { $set: { "starRating.$.rating": rating } }
      );
    } else {
      novel.starRating.push({ user: userId, rating: rating });
      await novel.save();
    }
    res.status(200).json(novel.starRating);
  } catch (error) {
    console.log("Error in addStarRating: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const searchForNovel = async (req, res) => {
  try {
    const searchQuery = req.params.searchQuery;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const novels = await Novel.find({ title: { $regex: searchQuery } }, null, {
      skip: page * limit,
      limit: limit,
    });
    if (novels.length === 0) {
      return res.status(200).json("Novels not found");
    }
    const total_novels = await Novel.find({ title: { $regex: searchQuery } });
    res.status(200).json({ pageData: novels, totalCount: total_novels.length });
  } catch (error) {
    console.log("Error in searchForNovel: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const novelId = req.params.id;
    const novel = await Novel.findById(novelId);
    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const reviews = await Review.find({ novel: novelId }, null, {
      skip: page * limit,
      limit: limit,
    }).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return res.status(404).json({ error: "Reviews not found" });
    }
    const total_reviews = await Review.find({ novel: novelId });
    res
      .status(200)
      .json({ pageData: reviews, totalCount: total_reviews.length });
  } catch (error) {
    console.log("Error in getReviews: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getGenres = async (req, res) => {
  try {
    const novelId = req.params.id;
    const novel = await Novel.findById(novelId);
    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }
    const genres = [];
    for (const genreId of novel.genres) {
      const genre = await Genre.findById(genreId);
      if (genre) genres.push(genre);
    }
    if (genres.length === 0) {
      return res.status(404).json({ error: "Genres not found" });
    }
    res.status(200).json(genres);
  } catch (error) {
    console.log("Error in getReviews: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const savedUnSavedByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const novelId = req.params.id;

    const novel = await Novel.findById(novelId);

    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }

    const userSaveNovel = novel.savedBy.includes(userId);

    if (userSaveNovel) {
      await Novel.updateOne({ _id: novelId }, { $pull: { savedBy: userId } });
      await User.updateOne({ _id: userId }, { $pull: { saves: novelId } });

      const updatedSaves = novel.savedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedSaves);
    } else {
      await User.updateOne({ _id: userId }, { $push: { saves: novelId } });
      novel.savedBy.push(userId);
      await novel.save();
      res.status(200).json(novel.savedBy);
    }
  } catch (error) {
    console.log("Error in savedUnSavedByUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getNovelsByAuthor = async (req, res) => {
  try {
    const author = req.params.author;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const novels = await Novel.find({ author: author }, null, {
      skip: page * limit,
      limit: limit,
    });
    if (novels.length === 0) {
      return res.status(404).json({ error: "Novels not found" });
    }
    const total_novels = await Novel.find({ author: author });
    res.status(200).json({ pageData: novels, totalCount: total_novels.length });
  } catch (error) {
    console.log("Error in getNovelsByAuthor: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getNovelsByYear = async (req, res) => {
  try {
    const year = req.params.year;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const novels = await Novel.find({ year: year }, null, {
      skip: page * limit,
      limit: limit,
    });
    if (novels.length === 0) {
      return res.status(404).json({ error: "Novels not found" });
    }
    const total_novels = await Novel.find({ year: year });
    res.status(200).json({ pageData: novels, totalCount: total_novels.length });
  } catch (error) {
    console.log("Error in getNovelsByYear: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteNovel = async (req, res) => {
  try {
    const novelId = req.params.id;
    const novel = await Novel.findById(novelId);
    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }
    if (novel.coverImg) {
      await cloudinary.uploader.destroy(
        novel.coverImg.split("/").pop().split(".")[0],
        {
          resource_type: "image",
        }
      );
    }
    for (const chapter of novel.chapters) {
      await Chapter.findByIdAndDelete(chapter);
    }
    for (const user of novel.savedBy) {
      await User.updateOne({ _id: user }, { $pull: { saves: novelId } });
    }
    await Novel.findByIdAndDelete(novelId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in getNovel: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
