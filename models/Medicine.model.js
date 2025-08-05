import { Schema } from "mongoose";
import mongoose from "mongoose";

import { db1_pharmacy } from "../config/database.js";

const medicineSchema = new Schema(
  {
    medicineName: { type: String, required: true },
    genericName: { type: String },
    batchNumber: { type: String, required: true, unique: true },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date, required: true },
    unitPrice: { type: Number, required: true },
    mrp: { type: Number },
    quantity: { type: Number, required: true, default: 0 },
    manufacturer: { type: String },
    category: { type: String },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }, // Reference to Supplier
    storageLocation: { type: String },
    notes: { type: String },
    lowStockThreshold: { type: Number, default: 10 }, // For low stock alerts
  },
  { timestamps: true }
);

export const Medicine = db1_pharmacy.model("Medicine", medicineSchema);
