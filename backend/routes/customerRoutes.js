import express from "express";
import {  } from "../controllers/accountController.js";
import { protect} from "../middlewares/authMiddleware.js";
import { getCustomer, getCustomerProfile, updateCustomerProfile } from "../controllers/customerController.js";

const router = express.Router();

router.get('/', protect, getCustomer);
router.route('/profile').get(protect, getCustomerProfile).put(protect, updateCustomerProfile);

export default router;