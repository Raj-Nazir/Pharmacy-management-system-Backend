// routes/saleRoutes.js
import e from "express";

import {
  getSales,
  getSaleById,
  createSale,
  generateInvoice,
} from "../controller/saleController.js";

import {
  protect,
  authorizeRoles,
  authorizePermissions,
} from "../middleware/authMiddleware.js";
const router = e.Router();

router.use(protect);

router.route("/").get(getSales).post(createSale);

router.route("/:id").get(getSaleById);

router
  .route("/:id/invoice")
  .get(authorizePermissions("sales"), generateInvoice);

export default router;
