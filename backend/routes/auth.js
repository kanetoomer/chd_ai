const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordUpdate,
} = require("../middleware/validateRequest");
const { authMiddleware } = require("../middleware/auth");

// Public routes
router.post("/register", validateRegistration, authController.register);
router.post("/login", validateLogin, authController.login);

// Protected routes
router.get("/me", authMiddleware, authController.getMe);
router.post("/logout", authMiddleware, authController.logout);
router.put(
  "/profile",
  authMiddleware,
  validateProfileUpdate,
  authController.updateProfile
);
router.put(
  "/password",
  authMiddleware,
  validatePasswordUpdate,
  authController.updatePassword
);

module.exports = router;
