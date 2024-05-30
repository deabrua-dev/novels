import mongoose from "mongoose";

const novelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    coverImg: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["inProgress", "ended", "hiatus"],
    },
    year: {
      type: String,
      required: true,
      default: "",
    },
    author: {
      type: String,
      required: true,
    },
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Genre",
        default: [],
      },
    ],
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
        default: [],
      },
    ],
    viewsCount: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
        default: [],
      },
    ],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    starRating: [
      {
        rating: { type: Number, min: 0, max: 5, default: 0 },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

const Novel = mongoose.model("Novel", novelSchema);

export default Novel;
