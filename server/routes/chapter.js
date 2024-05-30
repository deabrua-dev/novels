import { Router } from "express";
import {
  addChapter,
  getAllChapters,
  getChapter,
  getNext,
  addViewCount,
  getPrev,
  reviewOnChapter,
  getReviews,
} from "../controllers/chapter.js";
import { checkAuth } from "../middleware/checkAuth.js";

const router = Router();

router.get("/get/:id", getChapter);
router.get("/next-chapter/:id", getNext);
router.get("/prev-chapter/:id", getPrev);
router.get("/novel/:id", getAllChapters);
router.get("/reviews/:id", getReviews);

router.post("/add-chapter/", addChapter);
router.post("/review/:id", checkAuth, reviewOnChapter);
router.post("/addViewCount/:id", addViewCount);

export default router;
