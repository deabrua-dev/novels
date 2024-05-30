import Genre from "../models/genre.js";

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
