// routes/purchaseRoutes.js
import e from "express";

import {
  getPurchaseOrder,
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
} from "../controller/purchaseController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
const router = e.Router();

router.use(protect);

router.route("/").get(getPurchaseOrders).post(createPurchaseOrder);

router.route("/:id").get(getPurchaseOrder).delete(deletePurchaseOrder);

router.put("/:id/status", updatePurchaseOrderStatus);

export default router;
