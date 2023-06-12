import express from "express";
import { activeAccount, changeAlias, closeAccount, createAccount, getAccount, getUserAccounts } from "../controllers/accountController.js";
import { protect} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/', protect, getUserAccounts);
router.get('/getAccount', protect, getAccount);
router.post('/create', protect, createAccount);
router.post('/changeAlias', protect, changeAlias);
router.post('/close', protect, closeAccount);
router.post('/active', protect, activeAccount);

export default router;