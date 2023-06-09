import express from "express";
import { createAccount } from "../controllers/accountController.js";
import { protect, isAdmin, isClient } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route('/create').post(protect,createAccount);

export default router;