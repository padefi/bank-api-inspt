import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { generateToken, extendToken } from "../utils/generateToken.js";
import { isAdmin, loginIsClient } from "../middlewares/authMiddleware.js";
import { endUserExpiration, initialUserExpiration } from "../middlewares/sessionMiddleware.js";
import UserSession from "../models/userSessionModel.js";
import { decrypt } from "../utils/crypter.js";

// @desc    Login usuario & get token
// @route   POST /api/users/auth
// @access  Public
const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    // Validación
    if (!email || !password) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const user = await User.findOne({ email }).populate('role');

    if (user) {
        if (!user.isActive) {
            res.status(403);
            throw new Error('Usuario bloqueado. Por favor comuníquese con el banco.');
        } else if (await user.matchPassword(password)) {

            const userSession = await UserSession.findOne({ userId: user._id });

            if (userSession) {
                res.status(403);
                throw new Error('El usuario ya se encuentra logueado.');
            }

            req.session.userId = user._id;
            user.loginAttempts = 0;
            await user.save();
            initialUserExpiration(user._id, req.sessionID);
            generateToken(res, user._id);

            res.status(200).json({
                message: 'Usuario logueado.',
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role.name,
            });

        } else {
            if (user.loginAttempts >= 2 && loginIsClient(user.role.name)) user.isActive = false;
            user.loginAttempts += 1;
            await user.save();

            res.status(401);
            throw new Error('Usuario y/o contraseña incorrecta.');
        }
    } else {
        res.status(401);
        throw new Error('Usuario y/o contraseña incorrecta.');
    }
});

// @desc    Logout usuario / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {

    endUserExpiration(req.session.userId, req.sessionID);

    req.session.destroy();
    res.cookie('connect.sid', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({
        message: 'Usuario deslogueado.'
    });
});

// @desc    Registrar un nuevo usuario
// @route   POST /api/users/register
// @access  Private
const registerUser = asyncHandler(async (req, res) => {

    const { email, password, firstName, lastName, phone, governmentId, bornDate } = req.body;

    // Validación
    if (!email || !password || !firstName || !lastName || !governmentId) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error('La contraseña debe contener al menos 6 caracteres.');
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
        extendToken(req, res);
        res.status(201).json({
            message: 'Usuario creado con exito.',
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
        throw new Error('Información invalida.');
    }
});

// @desc    Datos del usuario
// @route   GET /api/users/profile
// @access  Private
const profileUser = asyncHandler(async (req, res) => {

    if (req.user) {
        extendToken(req, res);
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
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});

// @desc    Actualizar datos del usuario
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    if (user) {
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.phone = req.body.phone || user.phone;
        user.governmentId = req.body.governmentId || user.governmentId;
        user.bornDate = req.body.bornDate || user.bornDate;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updateUser = await user.save();

        extendToken(req, res);
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
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});

// @desc    Bloquear usuario
// @route   POST /api/users/lock
// @access  Private
const lockUser = asyncHandler(async (req, res) => {

    const { userId } = req.body;

    // Validación
    if (!isAdmin(req.user)) {
        res.status(403);
        throw new Error('Sin autorización.');
    }

    if (!userId) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const dencryptedId = await decrypt(userId);

    const user = await User.findById(dencryptedId);

    if (user) {
        user.isActive = false;
        user.loginAttempts = 0;

        const updateUser = await user.save();

        extendToken(req, res);
        res.json({
            message: 'Usuario bloqueado con éxito.'
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});

// @desc    Desbloquear usuario
// @route   POST /api/users/unlock
// @access  Private
const unlockUser = asyncHandler(async (req, res) => {

    const { userId } = req.body;

    // Validación
    if (!isAdmin(req.user)) {
        res.status(403);
        throw new Error('Sin autorización.');
    }

    if (!userId) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const dencryptedId = await decrypt(userId);

    const user = await User.findById(dencryptedId);

    if (user) {
        user.isActive = true;
        user.loginAttempts = 0;

        const updateUser = await user.save();

        extendToken(req, res);
        res.json({
            message: 'Usuario desbloqueado con éxito.'
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});

export {
    loginUser,
    logoutUser,
    registerUser,
    profileUser,
    updateUserProfile,
    lockUser,
    unlockUser,
}