// controllers/userController.js
import asyncHandler from "express-async-handler";
import { User } from "../models/User.model.js";
import { generateToken } from "../utils/generateToken.js";

import bcrypt from "bcryptjs";

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) res.json(user);
  else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const { name, role, permissions, status } = req.body;
  user.name = name || user.name;
  user.role = role || user.role;
  user.permissions = permissions || user.permissions;
  user.status = status || user.status;
  const updated = await user.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    username: updated.username,
    role: updated.role,
    permissions: updated.permissions,
    status: updated.status,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ message: "User removed" });
});

// @desc    Change password (self or admin)
// @route   PUT /api/users/:id/change-password
// @access  Admin or self
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { newPassword } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;
  await user.save();
  res.json({ message: "Password updated" });
});

export { deleteUser, changePassword };
