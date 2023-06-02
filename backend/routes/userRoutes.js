import express from "express";
import { loginUser, logoutUser, profileUser, registerUser, updateUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/register', registerUser);
router.route('/profile').get(profileUser).put(updateUserProfile);

export default router;