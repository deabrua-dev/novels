import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import {
  getUserProfile,
  getUsers,
  updateUser,
  getUser,
  getUserByReview,
  getReviews,
  getSaves,
} from "../controllers/user.js";

const router = express.Router();

router.get("/users", getUsers);
router.get("/get/:id", getUser);
router.get("/saves/:id", checkAuth, getSaves);
router.get("/reviews/:id", getReviews);
router.get("/get-by-review/:id", getUserByReview);
router.get("/profile/:username", checkAuth, getUserProfile);
router.post("/update", checkAuth, updateUser);

export default router;
