// controllers/authController.js
import asyncHandler from "express-async-handler";
import { User } from "../models/User.model.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (or admin after first)
export const registerUser = asyncHandler(async (req, res) => {
  const { name, username, password, role, permissions } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  if (await User.findOne({ username })) {
    res.status(400);
    throw new Error("User exists");
  }
  const user = await User.create({
    name: name,
    username: username,
    password: hashedPassword,
    role: role,
    permissions: permissions,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid data");
  }
});

// @desc    Authenticate & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
