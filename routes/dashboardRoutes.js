// routes/dashboardRoutes.js
import e from "express";

import {
  getMetrics,
  getRecentActivity,
  getSalesTrend,
  getStockOverview,
} from "../controller/dashboardController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
const router = e.Router();

router.use(protect);

router.get("/metrics", getMetrics);
router.get("/recent-activity", getRecentActivity);
router.get("/sales-trend", getSalesTrend);
router.get("/stock-overview", getStockOverview);

export default router;
