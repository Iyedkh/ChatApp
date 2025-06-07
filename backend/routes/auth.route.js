const express = require('express');
const {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
  updateUser,
  updateUserRole,
  getUsers
} = require('../controllers/auth.controller');
const { protectRoute, adminRoute } = require('../middleware/auth.middleware');
const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes (require authentication)
router.put("/update-profile", protectRoute, updateProfile); // For profile picture updates
router.put("/update-user", protectRoute, updateUser); // For updating user info (name, email, password)
router.get("/check", protectRoute, checkAuth);

// Admin-only routes
router.put("/:userId/role", protectRoute, adminRoute, updateUserRole); // For updating user roles
router.get("/users", protectRoute, adminRoute, getUsers);
module.exports = router;