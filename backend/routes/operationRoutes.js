import express from "express";
import { depositMoney, getOperations, transferMoney, withdrawMoney } from "../controllers/operationController.js";
import { protect, isAdmin, isClient } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route('/operations').get(protect, getOperations);
router.route('/withdraw').post(protect, withdrawMoney);
router.route('/deposit').post(protect, depositMoney);
router.route('/transfer').post(protect, transferMoney);

export default router;