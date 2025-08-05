// controllers/dashboardController.js
import asyncHandler from "express-async-handler";
import { Sale } from "../models/Sale.model.js";
import { Medicine } from "../models/Medicine.model.js";
import { PurchaseOrder } from "../models/PurchaseOrder.js";
import { Notification } from "../models/Notification.js";

// @desc    Get key dashboard metrics
// @route   GET /api/dashboard/metrics
// @access  Private
const getMetrics = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totalSalesToday = await Sale.aggregate([
    { $match: { saleDate: { $gte: today, $lt: tomorrow } } },
    { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = totalSalesToday[0]?.sum || 0;

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const totalRevenueThisMonth = await Sale.aggregate([
    { $match: { saleDate: { $gte: monthStart, $lt: tomorrow } } },
    { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
  ]);
  const revenueThisMonth = totalRevenueThisMonth[0]?.sum || 0;

  const outOfStockItems = await Medicine.countDocuments({ quantity: 0 });
  const expiringSoonItems = await Medicine.countDocuments({
    expiryDate: {
      $gte: today,
      $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  const newOrdersToday = await PurchaseOrder.countDocuments({
    orderDate: { $gte: today, $lt: tomorrow },
    status: "Pending",
  });

  res.json({
    totalSalesToday: totalRevenue,
    totalRevenueThisMonth: revenueThisMonth,
    outOfStockItems,
    expiringSoonItems,
    newOrdersToday,
  });
});

// @desc    Get recent activity (sales, low stock, new orders)
// @route   GET /api/dashboard/recent-activity
// @access  Private
const getRecentActivity = asyncHandler(async (req, res) => {
  const recentSales = await Sale.find({})
    .sort({ saleDate: -1 })
    .limit(5)
    .populate("customer", "name");

  const newOrders = await PurchaseOrder.find({ status: "Pending" })
    .sort({ orderDate: -1 })
    .limit(5)
    .populate("supplier", "name");

  const unreadNotifications = await Notification.find({ isRead: false })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({ recentSales, newOrders, notifications: unreadNotifications });
});

// @desc    Get sales trend (last N days)
// @route   GET /api/dashboard/sales-trend
// @access  Private
const getSalesTrend = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const pipeline = [
    { $match: { saleDate: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
        total: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ];
  const data = await Sale.aggregate(pipeline);
  res.json(data);
});

// @desc    Get stock overview (levels grouped by category)
// @route   GET /api/dashboard/stock-overview
// @access  Private
const getStockOverview = asyncHandler(async (req, res) => {
  const pipeline = [
    {
      $group: {
        _id: "$category",
        totalQty: { $sum: "$quantity" },
      },
    },
  ];
  const data = await Medicine.aggregate(pipeline);
  res.json(data);
});

export { getMetrics, getRecentActivity, getSalesTrend, getStockOverview };
