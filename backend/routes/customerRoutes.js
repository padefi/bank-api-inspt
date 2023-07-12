import express from "express";
import {  } from "../controllers/accountController.js";
import { protect} from "../middlewares/authMiddleware.js";
import { getCustomer } from "../controllers/customerController.js";

const router = express.Router();

router.get('/', protect, getCustomer);

export default router;