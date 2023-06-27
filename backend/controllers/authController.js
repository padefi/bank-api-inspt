import asyncHandler from "express-async-handler";
import { extendToken } from "../utils/generateToken.js";

// @desc    Comprueba que existan las cookies
// @route   POST /api/auth/check-cookies
// @access  Private
const userIsLog = asyncHandler(async (req, res) => {
    if (req.cookies) {
        extendToken(req, res);
        res.status(201).json({
            message: 'Cookies encontradas.',
            checkCookiesData: true
        });
    } else {
        res.status(400).json({
            message: 'Cookies no encontradas.',
            checkCookiesData: false
        });;
        throw new Error('Cookies no encontradas.');
    }
});

export {
    userIsLog
}