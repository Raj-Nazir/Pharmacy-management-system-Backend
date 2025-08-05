// controllers/saleController.js
import asyncHandler from "express-async-handler";
import { Sale } from "../models/Sale.model.js";
import { Medicine } from "../models/Medicine.model.js";
import { generateInvoicePdf } from "../utils/invoiceGenerator.js";

// import generateInvoicePdf from "../utils/invoiceGenerator.js";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    customer,
    invoiceNumber,
    page = 1,
    limit = 10,
  } = req.query;
  const query = {};

  if (startDate && endDate) {
    query.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (customer) query.customer = customer;
  if (invoiceNumber) query.invoiceNumber = invoiceNumber;

  const sales = await Sale.find(query)
    .populate("customer", "name phoneNumber")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ saleDate: -1 });

  const count = await Sale.countDocuments(query);
  res.json({ data: sales, page, pages: Math.ceil(count / limit) });
});

// @desc    Get sale by ID
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate("customer", "name phoneNumber")
    .populate("items.medicine", "medicineName unitPrice");
  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }
  res.json(sale);
});

// @desc    Create sale
// @route   POST /api/sales
// @access  Private
const createSale = asyncHandler(async (req, res) => {
  const { customer, items, paymentMethod, discount = 0, tax = 0 } = req.body;
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No items in sale");
  }

  let subtotal = 0;
  const populatedItems = await Promise.all(
    items.map(async (i) => {
      const med = await Medicine.findById(i.medicineId);
      if (!med) throw new Error(`Medicine ${i.medicineId} not found`);
      if (med.quantity < i.quantity)
        throw new Error(`Insufficient stock for ${med.medicineName}`);
      med.quantity -= i.quantity;
      await med.save();

      const totalPrice = i.quantity * med.unitPrice;
      subtotal += totalPrice;

      return {
        medicine: med._id,
        quantity: i.quantity,
        unitPrice: med.unitPrice,
        totalPrice,
      };
    })
  );

  const totalAmount = subtotal - discount + tax;
  const invoiceNumber = `INV-${Date.now()}`;

  const sale = await Sale.create({
    invoiceNumber,
    customer,
    items: populatedItems,
    subtotal,
    discount,
    tax,
    totalAmount,
    paymentMethod,
  });

  res.status(201).json(sale);
});

// @desc    Generate invoice PDF
// @route   GET /api/sales/:id/invoice
// @access  Private
const generateInvoice = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate("customer", "name phoneNumber")
    .populate("items.medicine", "medicineName unitPrice");

  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }

  const invoiceData = {
    invoiceNumber: sale.invoiceNumber,
    saleDate: sale.saleDate,
    customerName: sale.customer?.name || "Walk-in Customer",
    customerPhone: sale.customer?.phoneNumber || "",
    items: sale.items.map((i) => ({
      name: i.medicine.medicineName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
    })),
    subtotal: sale.subtotal,
    discount: sale.discount,
    tax: sale.tax,
    totalAmount: sale.totalAmount,
    shopName: process.env.SHOP_NAME,
    shopAddress: process.env.SHOP_ADDRESS,
    shopPhone: process.env.SHOP_PHONE,
    shopEmail: process.env.SHOP_EMAIL,
    shopLogo: process.env.SHOP_LOGO || null, // optional path
  };

  const filename = `Invoice_${sale.invoiceNumber}.pdf`;
  const tmpDir = path.join(__dirname, "..", "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  const tmpPath = path.join(tmpDir, filename);
  // only attempt PDF gen if we have a valid logo path:
  if (invoiceData.shopLogo && !fs.existsSync(invoiceData.shopLogo)) {
    console.warn(`Logo not found at ${invoiceData.shopLogo}, skipping logo`);
    invoiceData.shopLogo = null;
  }
  await generateInvoicePdf(invoiceData, tmpPath);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  const stream = fs.createReadStream(tmpPath);
  stream.pipe(res);
  // stream.on("close", () => {
  //   fs.unlink(tmpPath, () => {}); // Delete temp file
  // });

  // stream.on("error", (err) => {
  //   console.error("Stream error:", err);
  //   res.status(500).send("Error sending file");
  // });
  stream.on("end", () => fs.unlink(tmpPath, () => {}));
});

export { getSales, getSaleById, createSale, generateInvoice };
