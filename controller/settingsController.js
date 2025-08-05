// controllers/settingsController.js
import asyncHandler from "express-async-handler";

import { Setting } from "../models/Setting.model.js";

// @desc    Get system settings
// @route   GET /api/settings
// @access  Admin
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create(); // initialize defaults
  }
  res.json(settings);
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Admin
const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create();
  }
  Object.assign(settings, req.body);
  const updated = await settings.save();
  res.json(updated);
});

export { getSettings, updateSettings };
