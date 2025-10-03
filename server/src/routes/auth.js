import express from "express";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const users = new Map();

router.post("/login", (req, res) => {
  try {
    const { name, email, isAdmin = false } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      isAdmin: Boolean(isAdmin),
      loginTime: new Date().toISOString(),
    };

    users.set(user.id, user);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    // Return user info and token
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", authenticateToken, (req, res) => {
  const user = users.get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  });
});

router.post("/logout", authenticateToken, (res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;
