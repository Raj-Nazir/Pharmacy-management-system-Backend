// routes/notificationRoutes.js
import e from "express";

import {
  getNotifications,
  markRead,
  deleteNotification,
} from "../controller/notificationController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
const router = e.Router();

router.use(protect);

router.get("/", getNotifications);
router.put("/:id/read", markRead);
router.delete("/:id", deleteNotification);

export default router;
