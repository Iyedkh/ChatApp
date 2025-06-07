const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protectRoute = async (req, res, next) => {
  try {
    // 1. Get token from cookies
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in protectRoute:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === 'MongooseError') {
      return res.status(503).json({ message: "Database connection error" });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
};
// Add this to your auth.middleware.js
exports.adminRoute = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};