import express from "express";
import { userIsLog } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/check-cookies', userIsLog);

export default router;