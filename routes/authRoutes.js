// routes/authRoutes.js

import e from "express";

import {
  registerUser,
  authUser,
  getUserProfile,
} from "../controller/authController.js";

import { protect } from "../middleware/authMiddleware.js";
const router = e.Router();

router.post("/register", registerUser);
router.post("/login", authUser);
router.get("/me", protect, getUserProfile);

export default router;
