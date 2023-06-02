import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// @desc    Login usuario & get token
// @route   POST /api/users/auth
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    res.send('Login usuario');
});

// @desc    Logout usuario / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.send('Logout usuario');
});

// @desc    Registrar un nuevo usuario
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {

    const { email, password, firstName, lastName, phone, governmentId, bornDate } = req.body;

    // Validación
    if (!email || !password || !firstName || !lastName || !governmentId) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('Usuario ya registrado.');
    }

    const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        governmentId,
        bornDate
    })
});

// @desc    Datos del usuario
// @route   GET /api/users/profile
// @access  Private
const profileUser = asyncHandler(async (req, res) => {
    res.send('Datos del usuarios');
});

// @desc    Actualizar datos del usuario
// @route   GET /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    res.send('Actualizar datos del usuarios');
});

export {
    loginUser,
    logoutUser,
    registerUser,
    profileUser,
    updateUserProfile
}