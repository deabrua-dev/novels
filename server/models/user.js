import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isModerator: {
      type: Boolean,
      required: true,
      default: false,
    },
    profileImg: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "",
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
        default: [],
      },
    ],
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Novel",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
