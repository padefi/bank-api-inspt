import express from "express";
import {  } from "../controllers/accountController.js";
import { protect} from "../middlewares/authMiddleware.js";
import { createCustomer, getCustomer, getCustomerProfile, updateCustomerProfile } from "../controllers/customerController.js";

const router = express.Router();

router.get('/', protect, getCustomer);
router.post('/create', protect, createCustomer);
router.route('/profile').get(protect, getCustomerProfile).put(protect, updateCustomerProfile);

export default router;