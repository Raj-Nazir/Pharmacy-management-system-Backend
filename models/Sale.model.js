import { Schema } from "mongoose";
import mongoose from "mongoose";

import { db1_pharmacy } from "../config/database.js";

const saleItemSchema = new Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const saleSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" }, // Optional customer
    items: [saleItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI"],
      required: true,
    },
    saleDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Sale = db1_pharmacy.model("Sale", saleSchema);
