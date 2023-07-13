import express from "express";
import { lockUser, loginUser, logoutUser, profileUser, registerUser, unlockUser, updateUserProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/register', protect, registerUser);
router.route('/profile').get(protect, profileUser).put(protect, updateUserProfile);
router.post('/lock', protect, lockUser);
router.post('/unlock', protect, unlockUser);

export default router;