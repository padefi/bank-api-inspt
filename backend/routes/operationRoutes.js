import express from "express";
import { transferMoney } from "../controllers/operationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/transfer', protect,transferMoney);

export default router;