import express from "express";
import { activeAccount, closeAccount, createAccount, getUserAccounts } from "../controllers/accountController.js";
import { protect, isAdmin, isClient } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route('/show').get(protect,getUserAccounts);
router.route('/create').post(protect,createAccount);
router.route('/close').post(protect,closeAccount);
router.route('/active').post(protect,activeAccount);

export default router;