// routes/reportRoutes.js
import e from "express";

import {
  salesReport,
  lowStockReport,
  expiringSoonReport,
  inventoryValueReport,
  purchaseReport,
} from "../controller/reportController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
const router = e.Router();

router.use(protect);

router.get("/sales", salesReport);
router.get("/inventory/low-stock", lowStockReport);
router.get("/inventory/expiring-soon", expiringSoonReport);
router.get("/inventory/value", inventoryValueReport);
router.get("/purchases", purchaseReport);

export default router;
