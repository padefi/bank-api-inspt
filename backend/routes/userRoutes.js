import express from "express";
import { loginUser, logoutUser, profileUser, registerUser, updateUserProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/register', registerUser);
router.route('/profile').get(protect,profileUser).put(protect,updateUserProfile);

export default router;