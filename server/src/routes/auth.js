import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import authController from "../controllers/authController.js";

const router = express.Router();

router.post("/login", authController.login);
router.get("/me", authenticateToken, authController.getMe);

export default router;
