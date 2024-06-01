import Genre from "../models/genre.js";
import Novel from "../models/novel.js";

export const getAll = async (req, res) => {
  try {
    const genres = await Genre.find();
    if (genres.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(genres);
  } catch (error) {
    console.log("Error in getAll: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getGenre = async (req, res) => {
  try {
    const genreId = req.params.id;

    const genre = await Genre.findById(genreId);

    if (!genre) {
      return res.status(404).json({ error: "Genre not found" });
    }
    res.status(200).json(genre);
  } catch (error) {
    console.log("Error in getAll: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getNovelsWithGenre = async (req, res) => {
  try {
    const genreId = req.params.id;
    const genre = await Genre.findById(genreId);

    if (!genre) {
      return res.status(404).json({ error: "Genre not found" });
    }
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const novels = await Novel.find(
      { genres: { $elemMatch: { $eq: genreId } } },
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
      genres: { $elemMatch: { $eq: genreId } },
    });
    res.status(200).json({ pageData: novels, totalCount: total_novels.length });
  } catch (error) {
    console.log("Error in getNovelsWithGenre: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
