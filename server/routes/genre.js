import { Router } from "express";
import { getAll } from "../controllers/genre.js";

const router = Router();

router.get("/all", getAll);
router.get("/:id");

export default router;
