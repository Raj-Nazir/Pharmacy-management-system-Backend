import { Schema } from "mongoose";
import { db1_pharmacy } from "../config/database.js";

const settingSchema = new Schema(
  {
    shopName: { type: String, default: "My Pharmacy" },
    shopAddress: { type: String, default: "" },
    shopPhone: { type: String, default: "" },
    shopEmail: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    alertSettings: {
      lowStockThreshold: { type: Number, default: 10 },
      expiryNotificationDays: { type: Number, default: 60 },
    },
  },
  { timestamps: true }
);

export const Setting = db1_pharmacy.model("Setting", settingSchema);
