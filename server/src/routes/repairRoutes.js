import { Router } from "express";
import {
  createRepairRequest,
  getUserRepairRequests,
  getAllRepairRequests,
  updateRepairStatus,
} from "../controllers/repairController.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, createRepairRequest);
router.get("/my", protect, getUserRepairRequests);
router.get("/all", protect, isAdmin, getAllRepairRequests);
router.patch("/:id/status", protect, isAdmin, updateRepairStatus);

export default router;


