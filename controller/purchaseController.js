// controllers/purchaseController.js
import asyncHandler from "express-async-handler";

import { Medicine } from "../models/Medicine.model.js";

import { PurchaseOrder } from "../models/PurchaseOrder.js";
// @desc    Get all purchase orders
// @route   GET /api/purchases
// @access  Private
const getPurchaseOrders = asyncHandler(async (req, res) => {
  const {
    supplier,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = req.query;
  const query = {};

  if (supplier) query.supplier = supplier;
  if (status) query.status = status;
  if (startDate && endDate) {
    query.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const orders = await PurchaseOrder.find(query)
    .populate("supplier", "name")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ orderDate: -1 });

  const count = await PurchaseOrder.countDocuments(query);
  res.json({ data: orders, page, pages: Math.ceil(count / limit) });
});

// @desc    Get single purchase order
// @route   GET /api/purchases/:id
// @access  Private
const getPurchaseOrder = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findById(req.params.id)
    .populate("supplier", "name")
    .populate("items.medicine", "medicineName");
  if (!order) {
    res.status(404);
    throw new Error("Purchase order not found");
  }
  res.json(order);
});

// @desc    Create a purchase order
// @route   POST /api/purchases
// @access  Private
const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { supplierId, orderDate, expectedDeliveryDate, items } = req.body;
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No items in order");
  }

  let totalAmount = 0;
  const orderItems = items.map((i) => {
    const subtotal = i.quantityOrdered * i.unitPrice;
    totalAmount += subtotal;
    return {
      medicine: i.medicineId,
      quantityOrdered: i.quantityOrdered,
      unitPrice: i.unitPrice,
      subtotal,
    };
  });

  const order = await PurchaseOrder.create({
    poNumber: `PO-${Date.now()}`,
    supplier: supplierId,
    orderDate,
    expectedDeliveryDate,
    items: orderItems,
    totalAmount,
  });

  res.status(201).json(order);
});

// @desc    Update purchase order status
// @route   PUT /api/purchases/:id/status
// @access  Private
const updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = req.body.status || order.status;
  const updated = await order.save();

  // If delivered, increment medicine stock
  if (updated.status === "Delivered") {
    for (const item of updated.items) {
      const med = await Medicine.findById(item.medicine);
      if (med) {
        med.quantity += item.quantityOrdered;
        await med.save();
      }
    }
  }

  res.json(updated);
});

// @desc    Delete purchase order
// @route   DELETE /api/purchases/:id
// @access  Private
const deletePurchaseOrder = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.status !== "Pending") {
    res.status(400);
    throw new Error("Cannot delete delivered or cancelled orders");
  }
  await order.remove();
  res.json({ message: "Purchase order removed" });
});

export {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
};
