// routes/medicineRoutes.js
import e from "express";

import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../controller/medicineController.js";

import { protect } from "../middleware/authMiddleware.js";
const router = e.Router();

router.use(protect);

router.route("/").get(getMedicines).post(createMedicine);

router
  .route("/:id")
  .get(getMedicineById)
  .put(updateMedicine)
  .delete(deleteMedicine);

export default router;
