import { Router } from "express";
import {
  getAll,
  getGenre,
  getNovelsWithGenre,
} from "../controllers/genre.js";

const router = Router();

router.get("/all", getAll);
router.get("/:id", getGenre);
router.get("/novels/:id", getNovelsWithGenre);

export default router;
