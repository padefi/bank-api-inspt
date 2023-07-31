import asyncHandler from "express-async-handler";
import { extendToken } from "../utils/generateToken.js";

// @desc    Comprueba que existan las cookies
// @route   GET /api/auth/check-cookies
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
        logger.error('Cookies no encontradas.');
        throw new Error('Cookies no encontradas.');
    }
});

// @desc    Rol del usuario
// @route   GET /auth/users/role
// @access  Private
const userRole = asyncHandler(async (req, res) => {

    if (req.user.role.name) {
        res.status(201).json({
            role: req.user.role.name
        });
    } else {
        res.status(400).json({
            role: false
        });;
        logger.error('Rol no encontradas.');
        throw new Error('Rol no encontrado.');
    }
});

export {
    userIsLog,
    userRole,
}