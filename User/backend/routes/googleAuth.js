const express = require("express");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: req.user._id,
          email: req.user.email,
          role: req.user.role,
        },
        process.env.JWT_SECRET ||
          "your-super-secret-jwt-key-change-this-in-production",
        { expiresIn: "7d" },
      );

      // Redirect to frontend with token
      const redirectUrl =
        process.env.FRONTEND_URL || "https://apnadecoration.com";
      res.redirect(
        `${redirectUrl}/auth/success?token=${token}&user=${encodeURIComponent(
          JSON.stringify({
            id: req.user._id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
            avatar: req.user.avatar,
          }),
        )}`,
      );
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect(
        `${process.env.FRONTEND_URL || "https://apnadecoration.com"}/login?error=auth_failed`,
      );
    }
  },
);

module.exports = router;
