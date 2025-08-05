import { Schema } from "mongoose";
import mongoose from "mongoose";
const notificationSchema = new Schema({
  type: {
    type: String,
    enum: ["low_stock", "expiring_soon", "new_order", "other"],
    required: true,
  },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // E.g., Medicine ID, Sale ID
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model("Notification", notificationSchema);
