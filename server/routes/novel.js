import { Router } from "express";
import {
  getAll,
  createNovel,
  reviewOnNovel,
  addStarRating,
  getNovels,
  searchForNovel,
  getNovel,
  addViewCount,
  getReviews,
  getGenres,
  savedUnSavedByUser,
  getNovelsByAuthor,
  getNovelsByYear,
  updateNovel,
  deleteNovel,
} from "../controllers/novel.js";
import { checkAuth } from "../middleware/checkAuth.js";

const router = Router();

router.get("/all", getAll);

router.get("/novels", getNovels);
router.get("/get/:id", getNovel);
router.get("/reviews/:id", getReviews);
router.get("/genres/:id", getGenres);

router.get("/year/:year", getNovelsByYear);
router.get("/author/:author", getNovelsByAuthor);
router.get("/search/:searchQuery", searchForNovel);

router.post("/addViewCount/:id", addViewCount);
router.post("/create", checkAuth, createNovel);
router.post("/update/:id", checkAuth, updateNovel);
router.post("/save/:id", checkAuth, savedUnSavedByUser);
router.post("/review/:id", checkAuth, reviewOnNovel);
router.post("/rating/:id", checkAuth, addStarRating);

router.delete("/:id", checkAuth, deleteNovel);

export default router;
