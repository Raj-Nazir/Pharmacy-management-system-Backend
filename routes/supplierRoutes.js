// routes/supplierRoutes.js
import e from "express";

import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controller/supplierController.js";

import { protect } from "../middleware/authMiddleware.js";
const router = e.Router();

router.use(protect);

router.route("/").get(getSuppliers).post(createSupplier);

router
  .route("/:id")
  .get(getSupplierById)
  .put(updateSupplier)
  .delete(deleteSupplier);

export default router;
