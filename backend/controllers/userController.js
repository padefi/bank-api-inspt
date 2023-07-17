import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";
import { generateToken, extendToken } from "../utils/generateToken.js";
import { isAdmin } from "../middlewares/authMiddleware.js";
import { endUserExpiration, initialUserExpiration } from "../middlewares/sessionMiddleware.js";
import UserSession from "../models/userSessionModel.js";
import { decrypt, encrypt } from "../utils/crypter.js";

// @desc    Crear un nuevo usuario
// @route   POST /api/users/create
// @access  Private
const createUser = asyncHandler(async (req, res) => {

    const { governmentIdType, governmentId, lastName, firstName, bornDate, phoneNumber } = req.body;

    // Validación
    if (!governmentIdType || !governmentId || !lastName || !firstName || !bornDate || !phoneNumber) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    let userExists = await User.findOne({
        "governmentId.type": governmentIdType,
        "governmentId.number": governmentId,
        role: { $ne: "000000000000000000000002" },
    });

    if (userExists) {
        res.status(400);
        throw new Error('Usuario ya registrado.');
    }

    const initials = firstName.split(" ").map((name) => name.charAt(0).toLowerCase()).join("");
    const formattedLastName = lastName.toLowerCase().replace(/\s/g, '');
    let userName = initials.toLowerCase() + formattedLastName.toLowerCase();
    let email = userName + "@bancoinsptutn.com.ar";
    const governmentIdBD = {
        type: governmentIdType,
        number: governmentId
    }

    userExists = await User.findOne({ userName });

    if (userExists) {
        let count = 1;
        while (userExists) {
            userName = `${initials}${formattedLastName}${count}`;
            email = userName + "@bancoinsptutn.com.ar";
            userExists = await User.findOne({ userName });
            count++;
        }
    }

    const user = await User.create({
        userName,
        email,
        password: governmentId,
        role: "000000000000000000000001",
        firstName,
        lastName,
        phone: phoneNumber,
        governmentId: governmentIdBD,
        bornDate
    });

    if (user) {
        extendToken(req, res);
        res.status(201).json({
            message: 'Usuario creado con exito.',
        });
    } else {
        res.status(400);
        throw new Error('Información invalida.');
    }
});

// @desc    Ver usuarios
// @route   GET /api/user/
// @access  Private
const getUsers = asyncHandler(async (req, res) => {

    const { userData, userName, userType, userStatus } = req.query;

    if (!isAdmin(req.user)) {
        res.status(400);
        throw new Error('Sin autorización.');
    }

    const role = await Role.findOne({ name: 'cliente' });

    if (!role) {
        res.status(404);
        throw new Error('Rol no encontrado');
    }

    let matchConditions = [];

    if (userData || userName || userType || (userStatus !== '' && userStatus !== 'null')) {
        const conditions = [];

        if (userName) {
            conditions.push({ 'userName': { $regex: new RegExp(userName, 'i') } });
        }

        if (userData) {
            conditions.push({
                $or: [
                    { 'firstName': { $regex: new RegExp(userData, 'i') } },
                    { 'lastName': { $regex: new RegExp(userData, 'i') } },
                ]
            });
        }

        if ((userStatus !== '' && userStatus !== 'null')) {
            conditions.push({ 'isActive': userStatus === 'true' });
        }

        if (conditions.length > 0) {
            matchConditions.push({ $and: conditions });
        }
    }

    const users = await User.find({ role: { $ne: role._id }, ...(matchConditions.length > 0 ? { $and: matchConditions } : {}) })
        .select('_id userName firstName lastName isActive')
        .populate('role', '-_id name');

    if (!users) {
        res.status(403);
        throw new Error('No se encontraron usuarios.');
    }

    let newUsers = users.filter((user) => user.user !== null);

    newUsers = await Promise.all(newUsers.map(async (user) => {
        const encryptedId = await encrypt(user._id.toHexString());
        return { ...user.toObject(), _id: encryptedId };
    }));

    extendToken(req, res);
    res.status(201).json({
        user: newUsers
    });
});

// @desc    Obtener los tipo de usuario
// @route   POST /api/users/types
// @access  Private
const getUserRoles = asyncHandler(async (req, res) => {

    const roles = await Role.find({ name: { $ne: 'cliente' } }).select('_id name');

    if (!roles) {
        res.status(403);
        throw new Error('No se encontraron roles.');
    }

    let newRoles = roles.filter((user) => user.user !== null);

    newRoles = await Promise.all(newRoles.map(async (rol) => {
        const encryptedId = await encrypt(rol._id.toHexString());
        return { ...rol.toObject(), _id: encryptedId };
    }));

    res.status(201).json({
        roles: newRoles
    });
});

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
            if (user.loginAttempts >= 2 && loginIsCustomer(user.role.name)) user.isActive = false;
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
    createUser,
    getUsers,
    getUserRoles,
    loginUser,
    logoutUser,
    profileUser,
    updateUserProfile,
    lockUser,
    unlockUser,
}