import { Router } from "express";
import passport from "../config/googleOAuth.js";

import {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  createUser,
  getCurrentUser,
  updateCurrentUser,
  updateUser,
  deleteUser,
  googleAuthCallback,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Google OAuth routes (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  router.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false }),
    googleAuthCallback
  );
} else {
  // Return error if Google OAuth is not configured
  router.get("/auth/google", (req, res) => {
    res.status(503).json({
      error: "Google OAuth is not configured",
      message:
        "Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file",
    });
  });
  router.get("/auth/google/callback", (req, res) => {
    res.status(503).json({
      error: "Google OAuth is not configured",
      message:
        "Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file",
    });
  });
}

router.route("/").get(protect, getUsers).post(protect, createUser);
router
  .route("/me")
  .get(protect, getCurrentUser)
  .put(protect, updateCurrentUser);

router
  .route("/:id")
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, deleteUser);

export default router;
