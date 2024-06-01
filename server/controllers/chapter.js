import Novel from "../models/novel.js";
import Chapter from "../models/chapter.js";
import User from "../models/user.js";
import Review from "../models/review.js";

export const addChapter = async (req, res) => {
  try {
    const { novelId, chapterTitle, chapterBody } = req.body;

    const novel = await Novel.findById(novelId);
    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }
    if (
      novelId.length === 0 &&
      chapterTitle.length === 0 &&
      chapterBody.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Required fields are not filled in" });
    }
    const chapterNumber = novel.chapters.length + 1;
    const newChapter = new Chapter({
      chapterNumber: chapterNumber,
      novel: novelId,
      title: chapterTitle,
      body: chapterBody,
    });
    await newChapter.save();
    await Novel.updateOne(
      { _id: novelId },
      { $push: { chapters: newChapter._id } }
    );
    res.status(201).json(newChapter);
  } catch (error) {
    console.log("Error in addChapter: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateChapter = async (req, res) => {
  try {
    const { chapterId, chapterTitle, chapterBody } = req.body;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    if (
      chapterId.length === 0 &&
      chapterTitle.length === 0 &&
      chapterBody.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Required fields are not filled in" });
    }
    await Chapter.findByIdAndUpdate(chapterId, {
      title: chapterTitle,
      body: chapterBody,
    });
    res.status(201).json("Ok");
  } catch (error) {
    console.log("Error in addChapter: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getChapter = async (req, res) => {
  try {
    const chapterId = req.params.id;
    const chapter = await Chapter.findById(chapterId);

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }
    res.status(200).json(chapter);
  } catch (error) {
    console.log("Error in getChapter: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllChapters = async (req, res) => {
  try {
    const novelId = req.params.id;
    const chapters = await Chapter.find({ novel: novelId });
    if (chapters.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(chapters);
  } catch (error) {
    console.log("Error in getAllChapters: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const addViewCount = async (req, res) => {
  try {
    const chapterId = req.params.id;
    const chapter = await Chapter.findById(chapterId);
    chapter.viewsCount += 1;
    chapter.save();
    res.status(200).json(chapter);
  } catch (error) {
    console.log("Error in addViewCountChapter: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getNext = async (req, res) => {
  try {
    const chapterId = req.params.id;
    const current_chapter = await Chapter.findById(chapterId);

    if (!current_chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }
    const next_chapter = await Chapter.findOne({
      chapterNumber: current_chapter.chapterNumber + 1,
      novel: current_chapter.novel,
    });
    if (!next_chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }
    res.status(200).json(next_chapter);
  } catch (error) {
    console.log("Error in getNext: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getPrev = async (req, res) => {
  try {
    const chapterId = req.params.id;
    const current_chapter = await Chapter.findById(chapterId);

    if (!current_chapter || current_chapter.chapterNumber === 1) {
      return res.status(404).json({ error: "Chapter not found" });
    }
    const prev_chapter = await Chapter.findOne({
      chapterNumber: current_chapter.chapterNumber - 1,
      novel: current_chapter.novel,
    });
    if (!prev_chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }
    res.status(200).json(prev_chapter);
  } catch (error) {
    console.log("Error in getPrev: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const chapterId = req.params.id;
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const reviews = await Review.find({ chapter: chapterId }, null, {
      skip: page * limit,
      limit: limit,
    }).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return res.status(404).json({ error: "Reviews not found" });
    }
    const total_reviews = await Review.find({ chapter: chapterId });
    res
      .status(200)
      .json({ pageData: reviews, totalCount: total_reviews.length });
  } catch (error) {
    console.log("Error in : ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const reviewOnChapter = async (req, res) => {
  try {
    const { userId, text } = req.body;
    const chapterId = req.params.id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }
    const chapter = await Chapter.findById(chapterId);
    const user = await User.findById(userId);

    if (!chapter) {
      return res.status(404).json({ error: "Novel not found" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const review = new Review({ user: userId, chapter: chapter, body: text });

    chapter.reviews.push(review);
    user.reviews.push(review);
    await review.save();
    await chapter.save();
    await user.save();

    res.status(200);
  } catch (error) {
    console.log("Error in reviewOnChapter: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
