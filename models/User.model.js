import { Schema } from "mongoose";

import { db1_pharmacy } from "../config/database.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "staff",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    permissions: {
      dashboard: { type: Boolean, default: false },
      inventory: { type: Boolean, default: false },
      sales: { type: Boolean, default: false },
      purchases: { type: Boolean, default: false },
      reports: { type: Boolean, default: false },
      userManagement: { type: Boolean, default: false },
      settings: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

export const User = db1_pharmacy.model("User", userSchema);
