import Novel from "../models/novel.js";
import Genre from "../models/genre.js";
import User from "../models/user.js";
import Review from "../models/review.js";

import { v2 as cloudinary } from "cloudinary";

export const createNovel = async (req, res) => {
  try {
    const { title, description, status, year, author, genres } = req.body;
    let { coverImg } = req.body;
    const genreArray = [];

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
    for (let index = 0; index < genres.length; index++) {
      const find = await Genre.findOne({ name: genres[index] });
      genreArray.push(find._id);
    }

    const newNovel = new Novel({
      title: title,
      description: description,
      status: status,
      year: year,
      genres: genreArray,
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

export const getCount = async (req, res) => {
  try {
    const novels = await Novel.find();
    if (novels.length === 0) {
      return res.status(200).json(0);
    }
    res.status(200).json(novels.length);
  } catch (error) {
    console.log("Error in getCount: ", error.message);
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
    res.status(200).json(novels);
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
    res.status(200).json(user);
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

    if (reviews.length === 1) {
      return res.status(404).json({ error: "Reviews not found" });
    }
    res.status(200).json(reviews);
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

    const novel = await Novel.findById(postId);

    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }

    const userSaveNovel = novel.savedBy.includes(userId);

    if (userSaveNovel) {
      await Novel.updateOne({ _id: novelId }, { $pull: { savedBy: userId } });
      await User.updateOne({ _id: userId }, { $pull: { saved: novelId } });

      const updatedLikes = novel.savedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      novel.savedBy.push(userId);
      await User.updateOne({ _id: userId }, { $push: { saved: novelId } });
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
    const author = req.params.year;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const novels = await Novel.find({ author: author }, null, {
      skip: page * limit,
      limit: limit,
    });
    if (novels.length === 0) {
      return res.status(404).json({ error: "Novels not found" });
    }
    res.status(200).json(novels);
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
    res.status(200).json(novels);
  } catch (error) {
    console.log("Error in getNovelsByYear: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const countByYear = async (req, res) => {
  try {
    const year = req.params.year;
    const novels = await Novel.find({ year: year });
    res.status(200).json(novels.length);
  } catch (error) {
    console.log("Error in countByYear: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const countByAuthor = async (req, res) => {
  try {
    const author = req.params.author;
    const novels = await Novel.find({ author: author });
    res.status(200).json(novels.length);
  } catch (error) {
    console.log("Error in countByAuthor: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

// export const get = async (req, res) => {
//   try {
//     res.status(200).json(user);
//   } catch (error) {
//     console.log("Error in : ", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };
