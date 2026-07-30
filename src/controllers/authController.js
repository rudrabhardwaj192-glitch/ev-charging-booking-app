const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  createUser,
  findUserByEmail,
} = require("../models/userModel");

// ======================
// REGISTER
// ======================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(
      name,
      email,
      hashedPassword
    );

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ======================
// LOGIN
// ======================
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required",
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  register,
  login,
};