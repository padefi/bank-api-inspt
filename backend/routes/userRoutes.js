import express from "express";
import { activeUser, loginUser, logoutUser, profileUser, registerUser, updateUserProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/register', protect, registerUser);
router.route('/profile').get(protect, profileUser).put(protect, updateUserProfile);
router.post('/active', protect, activeUser);

export default router;