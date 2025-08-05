import { Schema } from "mongoose";
import { db1_pharmacy } from "../config/database.js";

const customerSchema = new Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, unique: true, sparse: true }, // sparse allows null values to not be unique
    email: { type: String },
    address: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Customer = db1_pharmacy.model("Customer", customerSchema);
