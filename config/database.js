import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

if (!process.env.MONGO_URI) {
  throw new Error("🛑 Missing MONGO_URI environment variable in process.env");
}

export const db1_pharmacy = mongoose.createConnection(process.env.MONGO_URI);

// "mongodb://127.0.0.1:27017/PharmacyManagementSystem"
