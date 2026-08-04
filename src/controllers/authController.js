const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const asyncHandler = require("../utils/asyncHandler");

const {
  createUser,
  findUserByEmail,
} = require("../models/userModel");

const { sendEmail } = require("../utils/emailService");
const welcomeEmail = require("../templates/welcomeEmail");

// =======================
// Register
// =======================
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await createUser(
    name,
    email,
    hashedPassword,
    role || "user"
  );

  // Send Welcome Email
  await sendEmail(
    email,
    "Welcome to EV Charging App 🚗⚡",
    welcomeEmail(name)
  );

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
});

// =======================
// Login
// =======================
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid password",
    });
  }

  // Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
  });
});

module.exports = {
  register,
  login,
};