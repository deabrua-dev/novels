import { Router } from "express";
import {
  getAll,
  getCount,
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
  countNovelsByYear,
  countNovelsByAuthor,
} from "../controllers/novel.js";
import { checkAuth } from "../middleware/checkAuth.js";

const router = Router();

router.get("/all", getAll);
router.get("/count", getCount);

router.get("/novels", getNovels);
router.get("/get/:id", getNovel);
router.get("/reviews/:id", getReviews);
router.get("/genres/:id", getGenres);
router.get("/author/:author", getNovelsByAuthor);
router.get("/year/:year", getNovelsByYear);

router.get("/countNovelsByYear/:year", countNovelsByYear);
router.get("/countNovelsByAuthor/:author", countNovelsByAuthor);

router.post("/addViewCount/:id", addViewCount);
router.post("/create", checkAuth, createNovel);
router.post("/save::id", checkAuth, savedUnSavedByUser);
router.post("/review/:id", checkAuth, reviewOnNovel);
router.post("/rating/:id", checkAuth, addStarRating);
router.post("/search/:searchQuery", searchForNovel);

export default router;
