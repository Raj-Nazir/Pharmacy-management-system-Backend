// controllers/medicineController.js
import asyncHandler from "express-async-handler";
import { Medicine } from "../models/Medicine.model.js";
// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
const getMedicines = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    manufacturer,
    lowStock,
    expiringSoon,
    page = 1,
    limit = 10,
  } = req.query;
  const query = {};

  query;

  if (search) query.medicineName = { $regex: search, $options: "i" };
  if (category) query.category = category;
  if (manufacturer) query.manufacturer = manufacturer;
  if (lowStock === "true")
    query.quantity = {
      $lte: req.user.settings?.alertSettings.lowStockThreshold || 10,
    };
  if (expiringSoon === "true") {
    const now = new Date(),
      soon = new Date();
    soon.setDate(
      now.getDate() +
        (req.user.settings?.alertSettings.expiryNotificationDays || 60)
    );
    query.expiryDate = { $gte: now, $lte: soon };
  }

  const medicines = await Medicine.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const count = await Medicine.countDocuments(query);
  res.json({ data: medicines, page, pages: Math.ceil(count / limit) });
});

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Private
const getMedicineById = asyncHandler(async (req, res) => {
  const med = await Medicine.findById(req.params.id);
  if (!med) {
    res.status(404);
    throw new Error("Medicine not found");
  }
  res.json(med);
});

// @desc    Create medicine
// @route   POST /api/medicines
// @access  Private
const createMedicine = asyncHandler(async (req, res) => {
  const newMed = new Medicine(req.body);
  const created = await newMed.save();
  res.status(201).json(created);
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private
const updateMedicine = asyncHandler(async (req, res) => {
  const med = await Medicine.findById(req.params.id);
  if (!med) {
    res.status(404);
    throw new Error("Medicine not found");
  }
  Object.assign(med, req.body);
  const updated = await med.save();
  res.json(updated);
});

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private
const deleteMedicine = asyncHandler(async (req, res) => {
  const med = await Medicine.findByIdAndDelete(req.params.id);
  if (!med) {
    res.status(404);
    throw new Error("Medicine not found");
  }

  // await Medicine.deleteOne({ _id: req.params.id });
  res.json({ message: "Medicine removed" });
});

export {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};
