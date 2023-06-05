import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// @desc    Login usuario & get token
// @route   POST /api/users/auth
// @access  Public
const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
        res.status(200).json({
            message: 'Usuario logueado'
        });

    } else {
        res.status(401);
        throw new Error('Usuario y/o contraseña incorrecta');
    }
});

// @desc    Logout usuario / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({
        message: 'Usuario deslogueado'
    });
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
    });

    if (user) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            governmentId: user.governmentId,
            bornDate: user.bornDate
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Datos del usuario
// @route   GET /api/users/profile
// @access  Private
const profileUser = asyncHandler(async (req, res) => {
    if (req.user) {
        res.status(201).json({
            _id: req.user._id,
            email: req.user.email,
            role: req.user.role,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            phone: req.user.phone,
            governmentId: req.user.governmentId,
            bornDate: req.user.bornDate
        });
    } else {
        res.status(400);
        throw new Error('Usuario no encontrado');
    }
});

// @desc    Actualizar datos del usuario
// @route   GET /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    
    if(user){
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.phone = req.body.phone || user.phone;
        user.governmentId = req.body.governmentId || user.governmentId;
        user.bornDate = req.body.bornDate || user.bornDate;

        if(req.body.password){
            user.password = req.body.password;
        }
        
        const updateUser = await user.save();

        res.json({           
            _id: updateUser._id,
            email: updateUser.email,
            role: updateUser.role,
            firstName: updateUser.firstName,
            lastName: updateUser.lastName,
            phone: updateUser.phone,
            governmentId: updateUser.governmentId,
            bornDate: updateUser.bornDate
        });      
    } else {
        res.status(400);
        throw new Error('Usuario no encontrado');
    }
});

export {
    loginUser,
    logoutUser,
    registerUser,
    profileUser,
    updateUserProfile
}