// routes/userRoutes.js
import e from "express";

import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
} from "../controller/userController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = e.Router();

router.use(protect, authorizeRoles("admin"));

router.route("/").get(getUsers);

router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

router.put("/:id/change-password", changePassword);

export default router;
