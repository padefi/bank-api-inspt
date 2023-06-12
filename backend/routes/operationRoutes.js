import express from "express";
import { depositMoney, getOperations, transferMoney, withdrawMoney } from "../controllers/operationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/operations', protect, getOperations);
router.post('/withdraw', protect, withdrawMoney);
router.post('/deposit', protect, depositMoney);
router.post('/transfer', protect, transferMoney);

export default router;