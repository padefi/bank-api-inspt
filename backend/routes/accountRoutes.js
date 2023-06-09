import express from "express";
import { activeAccount, closeAccount, createAccount, getAccount, getUserAccounts } from "../controllers/accountController.js";
import { protect, isAdmin, isClient } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/show', protect, getUserAccounts);
router.get('/getAccount', protect, getAccount);
router.post('/create', protect, createAccount);
router.post('/close', protect, closeAccount);
router.post('/active', protect, activeAccount);

export default router;