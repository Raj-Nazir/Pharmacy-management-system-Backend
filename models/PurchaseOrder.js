import { Schema } from "mongoose";
import mongoose from "mongoose";

import { db1_pharmacy } from "../config/database.js";

const purchaseOrderItemSchema = new Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  quantityOrdered: { type: Number, required: true },
  unitPrice: { type: Number, required: true }, // Price at the time of purchase
  subtotal: { type: Number, required: true },
});

const purchaseOrderSchema = new Schema(
  {
    poNumber: { type: String, required: true, unique: true },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    orderDate: { type: Date, required: true },
    expectedDeliveryDate: { type: Date },
    items: [purchaseOrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Delivered", "Cancelled"],
      default: "Pending",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const PurchaseOrder = db1_pharmacy.model(
  "PurchaseOrder",
  purchaseOrderSchema
);
