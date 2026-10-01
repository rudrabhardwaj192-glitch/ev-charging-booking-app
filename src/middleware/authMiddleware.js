const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.header("Authorization");

    // Check if header exists
    if (!authHeader) {
      return res.status(401).json({
        message: "Access Denied. No token provided.",
      });
    }

    // Header format: Bearer <token>
    const token = authHeader.split(" ")[1];

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save user data in request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
};

module.exports = authMiddleware;