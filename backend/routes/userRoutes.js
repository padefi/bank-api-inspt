import express from "express";
import { getUserRoles, getUsers, lockUser, loginUser, logoutUser, profileUser, createUser, unlockUser, updateUserProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/', protect, getUsers);
router.post('/create', protect, createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/roles', protect, getUserRoles);
router.route('/profile').get(protect, profileUser).put(protect, updateUserProfile);
router.post('/lock', protect, lockUser);
router.post('/unlock', protect, unlockUser);

export default router;