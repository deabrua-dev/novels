import express from "express";
import { getReview } from "../controllers/review.js";

const router = express.Router();

router.get("/get/:id", getReview);

export default router;
