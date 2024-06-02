import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import {
  updateUser,
  getUser,
  getUserByReview,
  getReviews,
  getSaves,
} from "../controllers/user.js";

const router = express.Router();

router.get("/get/:id", getUser);
router.get("/saves/:id", checkAuth, getSaves);
router.get("/reviews/:id", getReviews);
router.get("/get-by-review/:id", getUserByReview);

router.post("/update/:id", checkAuth, updateUser);

export default router;
