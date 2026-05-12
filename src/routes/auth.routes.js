import express from "express";
import passport from "passport";

import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Start Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    successRedirect: "/auth/profile",
  })
);

// Current user
router.get(
  "/profile",
  isAuthenticated,
  async (req, res) => {
    res.json({
      user: req.user,
    });
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.json({
      message: "Logged out",
    });
  });
});

// Failure
router.get("/failure", (req, res) => {
  res.status(401).json({
    message: "Google authentication failed",
  });
});

export default router;