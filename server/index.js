import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import novelRoutes from "./routes/novel.js";
import genreRoutes from "./routes/genre.js";
import chapterRoutes from "./routes/chapter.js";

import connectMongoDB from "./database/db.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/novel", novelRoutes);
app.use("/api/genre", genreRoutes);
app.use("/api/chapter", chapterRoutes);

app.listen(PORT, () => {
  console.log("Server run on ", PORT);
  connectMongoDB();
});
