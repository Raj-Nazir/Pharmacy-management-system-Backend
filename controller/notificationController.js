// controllers/notificationController.js
import asyncHandler from "express-async-handler";

import { Notification } from "../models/Notification.js";

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notes = await Notification.find({}).sort({ createdAt: -1 });
  res.json(notes);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markRead = asyncHandler(async (req, res) => {
  const note = await Notification.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error("Notification not found");
  }
  note.isRead = true;
  await note.save();
  res.json({ message: "Notification marked read" });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const note = await Notification.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error("Notification not found");
  }
  await note.remove();
  res.json({ message: "Notification removed" });
});

export { getNotifications, markRead, deleteNotification };
