const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protectRoute = async (req, res, next) => {
  try {
    // 1. Get token from cookies or header
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: "Not authorized, no token",
        solution: "Ensure you're logged in and cookies are enabled"
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: "User not found",
        solution: "Try logging in again or contact support"
      });
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in protectRoute:', error.message);
    
    const response = {
      error: error.name,
      message: error.message
    };

    if (error.name === 'TokenExpiredError') {
      response.solution = "Your session has expired. Please log in again.";
      return res.status(401).json(response);
    }
    if (error.name === 'JsonWebTokenError') {
      response.solution = "Invalid authentication token. Please log in again.";
      return res.status(401).json(response);
    }
    
    res.status(500).json({ 
      message: "Internal server error",
      solution: "Please try again later or contact support"
    });
  }
};
// Add this to your auth.middleware.js
exports.adminRoute = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};