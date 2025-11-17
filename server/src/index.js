import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import passport from "./config/googleOAuth.js";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import repairRoutes from "./routes/repairRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", "./.env") });

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/repairs", repairRoutes);

// Fallback route for /auth/callback - redirects to frontend
// This handles cases where the callback URL accidentally hits the server
app.get("/auth/callback", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  let redirectUrl = frontendUrl;
  
  // Ensure the URL is absolute
  if (!redirectUrl.startsWith("http://") && !redirectUrl.startsWith("https://")) {
    redirectUrl = `http://${redirectUrl}`;
  }
  
  // Remove trailing slash if present
  redirectUrl = redirectUrl.replace(/\/$/, "");
  
  // Preserve the token query parameter if present
  const token = req.query.token;
  if (token) {
    res.redirect(`${redirectUrl}/auth/callback?token=${token}`);
  } else {
    res.redirect(`${redirectUrl}/auth/callback`);
  }
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
