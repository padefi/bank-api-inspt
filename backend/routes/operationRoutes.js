import express from "express";
import { createOperation } from "../controllers/operationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/new', protect,createOperation);

export default router;