import { Router } from "express";
import {
  createLesson,
  getLessons,
  getUserLessons,
  getAllLessons,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = Router();

// Public route - get lessons for date range (for calendar display)
router.get("/", getLessons);

// Protected routes
router.post("/", protect, createLesson);
router.get("/my", protect, getUserLessons);
router.get("/all", protect, isAdmin, getAllLessons);
router.put("/:id", protect, updateLesson);
router.delete("/:id", protect, deleteLesson);

export default router;

