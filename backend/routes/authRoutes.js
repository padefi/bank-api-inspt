import express from "express";
import { userIsLog, userRole } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/check-cookies', userIsLog);
router.get('/role', protect, userRole);

export default router;