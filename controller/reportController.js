// controllers/reportController.js
import asyncHandler from "express-async-handler";
import { Sale } from "../models/Sale.model.js";
import { Medicine } from "../models/Medicine.model.js";
import { PurchaseOrder } from "../models/PurchaseOrder.js";

// @desc    Generate sales report
// @route   GET /api/reports/sales
// @access  Private
const salesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, type = "daily" } = req.query;
  const pipeline = [];

  if (startDate && endDate) {
    pipeline.push({
      $match: {
        saleDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    });
  }

  // Group by day/month/year
  let dateFormat;
  if (type === "monthly")
    dateFormat = { $dateToString: { format: "%Y-%m", date: "$saleDate" } };
  else if (type === "yearly")
    dateFormat = { $dateToString: { format: "%Y", date: "$saleDate" } };
  else
    dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } };

  pipeline.push(
    {
      $group: {
        _id: dateFormat,
        totalSales: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    }
  );

  const data = await Sale.aggregate(pipeline);
  res.json(data);
});

// @desc    Low stock report
// @route   GET /api/reports/inventory/low-stock
// @access  Private
const lowStockReport = asyncHandler(async (req, res) => {
  const meds = await Medicine.find({
    quantity: {
      $lte: req.user.settings?.alertSettings.lowStockThreshold || 10,
    },
  });
  res.json(meds);
});

// @desc    Expiring soon report
// @route   GET /api/reports/inventory/expiring-soon
// @access  Private
const expiringSoonReport = asyncHandler(async (req, res) => {
  const days = req.user.settings?.alertSettings.expiryNotificationDays || 60;
  const now = new Date(),
    soon = new Date();
  soon.setDate(now.getDate() + days);
  const meds = await Medicine.find({ expiryDate: { $gte: now, $lte: soon } });
  res.json(meds);
});

// @desc    Inventory value report
// @route   GET /api/reports/inventory/value
// @access  Private
const inventoryValueReport = asyncHandler(async (req, res) => {
  const meds = await Medicine.find({});
  const totalValue = meds.reduce((sum, m) => sum + m.quantity * m.unitPrice, 0);
  res.json({ totalValue });
});

// @desc    Purchase report
// @route   GET /api/reports/purchases
// @access  Private
const purchaseReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = {};
  if (startDate && endDate) {
    query.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  const orders = await PurchaseOrder.find(query).populate("supplier", "name");
  res.json(orders);
});

export {
  salesReport,
  lowStockReport,
  expiringSoonReport,
  inventoryValueReport,
  purchaseReport,
};
