import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const ensureUserPayload = (payload) => {
  const { name, email, password } = payload;
  if (!name || !email || !password) {
    const missing = [
      !name ? "name" : null,
      !email ? "email" : null,
      !password ? "password" : null,
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(`Missing required fields: ${missing}`);
  }
};

const hydrateUserFields = async ({ name, email, password }) => {
  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (password) {
    updates.password = await bcrypt.hash(password, 10);
  }
  return updates;
};

export const registerUser = asyncHandler(async (req, res) => {
  try {
    ensureUserPayload(req.body);
  } catch (error) {
    res.status(400);
    throw error;
  }

  const existing = await User.findOne({ email: req.body.email });

  if (existing) {
    res.status(409);
    throw new Error("User already exists");
  }

  const user = await User.create({
    ...(await hydrateUserFields({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    })),
    authProvider: "local",
  });

  res.status(201).json({
    user,
    token: generateToken(user._id),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Check if user has a password (not Google-only account)
  if (!user.password) {
    res.status(401);
    throw new Error("This account uses Google sign-in. Please sign in with Google.");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  user.lastLogin = new Date();
  await user.save();

  res.json({
    user: user.toJSON(),
    token: generateToken(user._id),
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

export const createUser = asyncHandler(async (req, res) => {
  try {
    ensureUserPayload(req.body);
  } catch (error) {
    res.status(400);
    throw error;
  }

  const existing = await User.findOne({ email: req.body.email });

  if (existing) {
    res.status(409);
    throw new Error("User already exists");
  }

  const user = await User.create(await hydrateUserFields(req.body));

  res.status(201).json(user);
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const updateCurrentUser = asyncHandler(async (req, res) => {
  const updates = {};
  const { name, email, password } = req.body;

  if (name) updates.name = name;
  if (email) updates.email = email;
  if (password) {
    updates.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.json(updatedUser);
});

export const updateUser = asyncHandler(async (req, res) => {
  const updates = await hydrateUserFields(req.body);

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();

  res.status(204).send();
});

export const googleAuthCallback = asyncHandler(async (req, res) => {
  // This will be called after Passport authenticates the user
  // The user should be attached to req.user by Passport
  console.log('[Google Auth] Callback handler called');
  console.log('[Google Auth] req.user:', req.user ? { id: req.user._id, email: req.user.email } : 'null');
  
  if (!req.user) {
    console.error('[Google Auth] No user found in request');
    res.status(401);
    throw new Error("Google authentication failed");
  }

  const token = generateToken(req.user._id);
  console.log('[Google Auth] Token generated:', {
    userId: req.user._id.toString(),
    tokenLength: token.length,
    tokenPreview: token.substring(0, 20) + '...',
  });

  // Redirect to frontend with token
  // For development, we'll redirect to a callback URL with token
  // In production, you might want to use a different approach (e.g., postMessage)
  let frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  console.log('[Google Auth] FRONTEND_URL from env:', process.env.FRONTEND_URL);
  
  // Ensure the URL is absolute (has protocol)
  if (!frontendUrl.startsWith("http://") && !frontendUrl.startsWith("https://")) {
    // If relative URL provided, assume http://
    frontendUrl = `http://${frontendUrl}`;
  }
  
  // Remove trailing slash if present
  frontendUrl = frontendUrl.replace(/\/$/, "");
  
  // URL encode the token to ensure special characters are handled correctly
  const encodedToken = encodeURIComponent(token);
  const redirectUrl = `${frontendUrl}/auth/callback?token=${encodedToken}`;
  
  console.log('[Google Auth] Redirect details:', {
    frontendUrl,
    redirectUrl: `${frontendUrl}/auth/callback?token=${encodedToken.substring(0, 20)}...`,
    tokenEncoded: encodedToken !== token,
    redirectUrlLength: redirectUrl.length,
    tokenLength: token.length,
    encodedTokenLength: encodedToken.length,
  });
  
  // Warn if URL is very long (some servers/browsers have limits)
  if (redirectUrl.length > 2000) {
    console.warn('[Google Auth] WARNING: Redirect URL is very long:', redirectUrl.length, 'characters');
    console.warn('[Google Auth] Some servers may truncate URLs over 2000 characters');
  }
  
  console.log(`[Google Auth] Redirecting to frontend: ${frontendUrl}/auth/callback`);
  res.redirect(redirectUrl);
});


