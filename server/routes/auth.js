import { Router } from "express";
import { login, logout, register, getAuthUser } from "../controllers/auth.js";
import { checkAuth } from "../middleware/checkAuth.js";

const router = Router();

router.get("/me", checkAuth, getAuthUser);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
