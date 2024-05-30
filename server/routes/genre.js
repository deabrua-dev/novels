import { Router } from "express";
import {
  getAll,
  getGenre,
  getNovelsWithGenre,
  countNovels,
} from "../controllers/genre.js";

const router = Router();

router.get("/all", getAll);
router.get("/:id", getGenre);
router.get("/countNovels/:id", countNovels);
router.get("/novels/:id", getNovelsWithGenre);

export default router;
