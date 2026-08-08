const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // Allow both admin and owner
  if (
    req.user.role !== "admin" &&
    req.user.role !== "owner"
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }

  next();
};

module.exports = isAdmin;