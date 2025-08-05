// routes/settingsRoutes.js
import e from "express";

import {
  getSettings,
  updateSettings,
} from "../controller/settingsController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
const router = e.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/", getSettings);
router.put("/", updateSettings);

export default router;
