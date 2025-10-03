import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { roomsController } from "../controllers/roomsController.js";

const router = express.Router();

router.get("/", authenticateToken, roomsController.getAllRooms);
router.post("/", authenticateToken, requireAdmin, roomsController.createRoom);
router.get("/:roomName", authenticateToken, roomsController.getRoom);
router.delete(
  "/:roomName",
  authenticateToken,
  requireAdmin,
  roomsController.deleteRoom
);

export default router;
