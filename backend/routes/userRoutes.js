import express from "express";
import { getUserRoles, getUsers, lockUser, loginUser, logoutUser, profileUser, createUser, unlockUser, updateUserProfile, userProfile, updateProfileUser, updateUserPassword, forgotUserPassword, getUserClearPassword } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/', protect, getUsers);
router.post('/create', protect, createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/updatePassword', updateUserPassword);
router.post('/forgotPassword', forgotUserPassword);
router.get('/clearPassword', getUserClearPassword);
router.get('/roles', protect, getUserRoles);
router.route('/profile').get(protect, userProfile).put(protect, updateUserProfile);
router.route('/profileUser').get(protect, profileUser).put(protect, updateProfileUser);
router.post('/lock', protect, lockUser);
router.post('/unlock', protect, unlockUser);

export default router;