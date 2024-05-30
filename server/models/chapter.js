import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    chapterNumber: {
      type: Number,
      required: true,
    },
    novel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Novel",
      required: true,
    },
    title: {
      type: String,
      default: "",
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
        default: [],
      },
    ],
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Chapter = mongoose.model("Chapter", chapterSchema);

export default Chapter;
