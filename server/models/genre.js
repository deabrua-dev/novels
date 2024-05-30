import mongoose from "mongoose";

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
});

const Genre = mongoose.model("Genre", genreSchema);

export default Genre;
