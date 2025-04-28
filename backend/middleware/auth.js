const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    console.log("🧠 Raw Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No Bearer token provided");
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("Token is missing after Bearer");
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("User not found for decoded ID");
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }

  console.log("AuthMiddleware: User ID =", req.user?._id);
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied: Admin privileges required",
  });
};

module.exports = {
  authMiddleware,
  adminMiddleware,
};
