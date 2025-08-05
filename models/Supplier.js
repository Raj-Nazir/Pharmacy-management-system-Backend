import { Schema } from "mongoose";

import { db1_pharmacy } from "../config/database.js";

const supplierSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    contactPerson: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    address: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Supplier = db1_pharmacy.model("Supplier", supplierSchema);
