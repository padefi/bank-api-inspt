import express from "express";
import { getOperations, transferMoney } from "../controllers/operationController.js";
import { protect, isAdmin, isClient } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route('/transfer').get(protect, getOperations).put(protect, transferMoney);

export default router;