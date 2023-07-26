import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";
import { generateToken, extendToken } from "../utils/generateToken.js";
import { isAdmin, isCustomer, loginIsCustomer } from "../middlewares/authMiddleware.js";
import { endUserExpiration, initialUserExpiration } from "../middlewares/sessionMiddleware.js";
import UserSession from "../models/userSessionModel.js";
import { decrypt, encrypt } from "../utils/crypter.js";
import sendEmail from "../utils/sendEmail.js";
import { v4 as uuidv4 } from "uuid";
import ResetPassword from "../models/resetPasswordModel.js";
import logger from '../utils/logger.js';

// @desc    Crear un nuevo usuario
// @route   POST /api/users/create
// @access  Private
const createUser = asyncHandler(async (req, res) => {
    logger.info(`createUser por el usuario: ${req.user._id}`);

    const { governmentId, lastName, firstName, bornDate, phoneNumber } = req.body;

    // Validación
    if (!governmentId || !lastName || !firstName || !bornDate || !phoneNumber) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    const governmentIdType = 'cuil';

    let userExists = await User.findOne({
        "governmentId.type": governmentIdType,
        "governmentId.number": governmentId,
        role: { $ne: "000000000000000000000002" },
    });

    if (userExists) {
        res.status(400);
        logger.warn('Usuario ya registrado.');
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
        logger.error(`Ha ocurrido un error al crear el usuario.`);
        throw new Error('Información invalida.');
    }
});

// @desc    Ver usuarios
// @route   GET /api/user/
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
    logger.info(`getUsers por el usuario: ${req.user._id}`);

    const { userData, userName, userRole, userStatus } = req.query;

    if (!isAdmin(req.user)) {
        res.status(400);
        logger.warn(`Usuario no autorizado: ${req.user._id}`);
        throw new Error('Sin autorización.');
    }

    const role = await Role.findOne({ name: 'cliente' });

    if (!role) {
        res.status(404);
        logger.error('Ha ocurrido un error al obtener los datos.');
        throw new Error('Rol no encontrado');
    }

    let matchConditions = [];

    if (userData || userName || (userRole !== '' && userRole !== 'null') || (userStatus !== '' && userStatus !== 'null')) {
        const conditions = [];

        if (userData) {
            conditions.push({
                $or: [
                    { firstName: { $regex: new RegExp(userData, 'i') } },
                    { lastName: { $regex: new RegExp(userData, 'i') } },
                ]
            });
        }

        if (userName) {
            conditions.push({ userName: { $regex: new RegExp(userName, 'i') } });
        }

        if (userRole !== '' && userRole !== 'null') {
            conditions.push({ role: decrypt(userRole) });
        }

        if ((userStatus !== '' && userStatus !== 'null')) {
            conditions.push({ isActive: userStatus === 'true' });
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
        logger.error('Usuarios no encontrados.');
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
    logger.info(`getUserRoles por el usuario: ${req.user._id}`);

    const roles = await Role.find({ name: { $ne: 'cliente' } }).select('_id name');

    if (!roles) {
        res.status(403);
        logger.error('Ha ocurrido un error al obtener los datos.');
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
    logger.info(`loginUser por el usuario: ${req.body.userName}`);

    const { userName, password } = req.body;

    // Validación
    if (!userName || !password) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    const user = await User.findOne({ userName }).populate('role');

    if (user) {
        if (!user.isActive) {
            res.status(403);
            logger.warn(`Usuario bloqueado ${userName}. Por favor comuníquese con el banco.`);
            throw new Error('Usuario bloqueado. Por favor comuníquese con el banco.');
        } else if (await user.matchPassword(password)) {

            const userSession = await UserSession.findOne({ userId: user._id });

            if (userSession) {
                res.status(403);
                logger.warn(`El usuario ${userName} ya se encuentra logueado.`);
                throw new Error('El usuario ya se encuentra logueado.');
            }

            if (user.isPasswordResetRequired) {
                const userId = encrypt(user._id);
                res.status(401).json({
                    message: 'Debe cambiar su contraseña.',
                    userId,
                    resetRequired: user.isPasswordResetRequired,
                });
            } else {

                req.session.userId = user._id;
                user.loginAttempts = 0;
                await user.save();
                initialUserExpiration(user._id, req.sessionID);
                generateToken(res, user._id);
                
                const userData = (user.lastName === user.firstName) ? user.lastName : user.lastName + ' ' + user.firstName;

                res.status(200).json({
                    message: 'Usuario logueado.',
                    userName: user.userName,
                    role: user.role.name,
                    userData: userData,
                });
            }
        } else {
            if (user.loginAttempts >= 2 && loginIsCustomer(user.role.name)) user.isActive = false;
            user.loginAttempts += 1;
            await user.save();

            res.status(401);
            logger.warn('Datos de acceso incorrectos.');
            throw new Error('Usuario y/o contraseña incorrecta.');
        }
    } else {
        res.status(401);
        logger.warn('Datos de acceso incorrectos.');
        throw new Error('Usuario y/o contraseña incorrecta.');
    }
});

// @desc    Logout usuario / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    logger.info(`logoutUser por el usuario: ${req.session.userId}`);

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

// @desc    Actualizar datos del usuario
// @route   PUT /api/users/updatePassword
// @access  Private
const updateUserPassword = asyncHandler(async (req, res) => {
    logger.info(`updateUserPassword por el usuario: ${req.user._id}`);

    const { userId, password } = req.body;

    // Validación
    if (!userId || !password) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    const dencryptedId = await decrypt(userId);

    const user = await User.findById(dencryptedId);

    if (!user) {
        res.status(404);
        logger.error(`Usuario no encontrado: ${dencryptedId}`);
        throw new Error('Usuario no encontrado.');
    }

    if (user) {
        user.password = req.body.password;
        user.isPasswordResetRequired = false;

        const updateUser = await user.save();

        res.json({
            message: 'Contraseña actualizada con exito.'
        });
    } else {
        res.status(404);
        logger.error(`Usuario no encontrado: ${dencryptedId}`);
        throw new Error('Usuario no encontrado.');
    }
});

// @desc    Envía mail para restablecer la contraseña del usuario
// @route   POST /api/users/forgotPassword
// @access  Private
const forgotUserPassword = asyncHandler(async (req, res) => {
    logger.info(`forgotUserPassword por el usuario: ${req.user._id}`);

    const { userName } = req.body;

    // Validación
    if (!userName) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    const user = await User.findOne({ userName });

    if (user) {

        let token = await ResetPassword.findOne({ userId: user._id })

        if (token) {
            await ResetPassword.deleteOne();
        }

        let resetToken = uuidv4();

        await new ResetPassword({
            userId: user._id,
            token: resetToken,
            expirationTime: new Date(Date.now() + 1000 * 60 * 30)
        }).save();

        const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
        const userData = (user.lastName === user.firstName) ? user.lastName : user.lastName + ', ' + user.firstName;

        const message = `
        <h2>Hola ${userData}</h2>
        <p>Por favor, acceda al siguiente enlance para restablecer su contraseña.</p>
        <p>Este es valido por 30 minutos.</p>

        <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>

        <p>Banco INSPT UTN</p>
        `;

        const subject = "Restablecer contraseña";
        const send_to = user.email;
        const sent_from = process.env.EMAIL_USER;

        await sendEmail(subject, message, send_to, sent_from);

        res.status(200).json({
            message: 'Email enviado con éxito.'
        });
    } else {
        res.status(200).json({
            message: 'Email enviado con exito.'
        });
    }
});

// @desc    Datos del usuario para restablecer la contraseña
// @route   POST /api/users/clearPassword
// @access  Private
const getUserClearPassword = asyncHandler(async (req, res) => {
    logger.info(`getUserClearPassword por el usuario: ${req.user._id}`);

    const { token } = req.query;

    // Validación
    if (!token) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    const user = await ResetPassword.findOne({ token }).select('-_id userId');

    if (!user) {
        res.status(404);
        logger.warn(`Token invalido: ${token}.`);
        throw new Error('Enlace invalido.');
    }

    let newUser = user;

    const userId = newUser.userId.toHexString();
    const encryptedUserId = await encrypt(userId);
    newUser = { ...newUser.toObject(), userId: encryptedUserId };

    if (user) {
        await ResetPassword.deleteOne();
    }

    res.status(200).json({
        user: newUser
    });
});

// @desc    Datos del usuario
// @route   GET /api/users/profile
// @access  Private
const userProfile = asyncHandler(async (req, res) => {
    logger.info(`userProfile por el usuario: ${req.user._id}`);

    const { id } = req.query;

    // Validación
    if (!id) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    if (!isAdmin(req.user)) {
        res.status(400);
        logger.warn(`Usuario no autorizado: ${req.user._id}`);
        throw new Error('Sin autorización.');
    }

    const dencryptedId = await decrypt(id);

    const user = await User.findById(dencryptedId)
        .select('-_id userName bornDate email firstName governmentId lastName phone isActive')
        .populate('role', '_id name');

    if (!user) {
        res.status(404);
        logger.error(`Usuario no encontrado: ${dencryptedId}`);
        throw new Error('Usuario no encontrado.');
    }

    let newUser = user;

    const roleId = newUser.role._id.toHexString();
    const encryptedRoleId = await encrypt(roleId);
    newUser = { ...newUser.toObject(), role: { ...user.role.toObject(), _id: encryptedRoleId } };

    extendToken(req, res);
    res.status(201).json({
        user: newUser
    });
});

// @desc    Actualizar datos del usuario
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    logger.info(`updateUserProfile por el usuario: ${req.user._id}`);

    const { userId, governmentId, bornDate, lastName, firstName, phoneNumber, userRole } = req.body;

    // Validación
    if (!userId || !governmentId || !bornDate || !lastName || !firstName || !phoneNumber || !userRole) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    if (!isAdmin(req.user)) {
        res.status(400);
        logger.warn(`Usuario no autorizado: ${req.user._id}`);
        throw new Error('Sin autorización.');
    }

    const dencryptedId = await decrypt(userId);

    const user = await User.findById(dencryptedId);

    if (!user) {
        res.status(404);
        logger.error(`Usuario no encontrado: ${dencryptedId}`);
        throw new Error('Usuario no encontrado.');
    }

    const dencryptedRoleId = await decrypt(userRole);

    if (user) {
        user.role = dencryptedRoleId || user.role;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phone = phoneNumber || user.phone;
        user.governmentId.number = governmentId || user.governmentId.number;
        user.bornDate = bornDate || user.bornDate;

        const updateUser = await user.save();

        extendToken(req, res);
        res.json({
            message: 'Usuario actualizado con éxito.'
        });
    } else {
        res.status(404);
        logger.error(`Usuario no encontrado: ${dencryptedId}`);
        throw new Error('Usuario no encontrado.');
    }
});

// @desc    Datos del usuario
// @route   GET /api/users/profileUser
// @access  Private
const profileUser = asyncHandler(async (req, res) => {
    logger.info(`profileUser por el usuario: ${req.user._id}`);

    if (req.user) {
        extendToken(req, res);
        res.status(201).json({
            userName: req.user.userName,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            phone: req.user.phone,
            governmentId: req.user.governmentId,
            bornDate: req.user.bornDate
        });
    } else {
        res.status(404);
        logger.error(`Usuario no encontrado: ${dencryptedId}`);
        throw new Error('Usuario no encontrado.');
    }
});

// @desc    Actualizar datos del usuario
// @route   PUT /api/users/profileUser
// @access  Private
const updateProfileUser = asyncHandler(async (req, res) => {
    logger.info(`updateProfileUser por el usuario: ${req.user._id}`);

    const user = await User.findById(req.user._id);

    if (user) {
        if (isCustomer(req.user)) {
            user.email = req.body.email || user.email;
        }
        user.phone = req.body.phone || user.phone;
        user.bornDate = req.body.bornDate || user.bornDate;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updateUser = await user.save();

        extendToken(req, res);
        res.json({
            message: 'Perfil actualizado con éxito.'
        });
    } else {
        res.status(404);
        logger.error(`Usuario no encontrado: ${dencryptedId}`);
        throw new Error('Perfil no encontrado.');
    }
});

// @desc    Bloquear usuario
// @route   POST /api/users/lock
// @access  Private
const lockUser = asyncHandler(async (req, res) => {
    logger.info(`lockUser por el usuario: ${req.user._id}`);

    const { userId } = req.body;

    // Validación
    if (!isAdmin(req.user)) {
        res.status(403);
        logger.warn(`Usuario no autorizado: ${req.user._id}`);
        throw new Error('Sin autorización.');
    }

    if (!userId) {
        res.status(400);
        logger.warn('Campos sin completar.');
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
        logger.error(`Usuario no encontrado: ${dencryptedId}`);
        throw new Error('Usuario no encontrado.');
    }
});

// @desc    Desbloquear usuario
// @route   POST /api/users/unlock
// @access  Private
const unlockUser = asyncHandler(async (req, res) => {
    logger.info(`unlockUser por el usuario: ${req.user._id}`);

    const { userId } = req.body;

    // Validación
    if (!isAdmin(req.user)) {
        res.status(403);
        logger.warn(`Usuario no autorizado: ${req.user._id}`);
        throw new Error('Sin autorización.');
    }

    if (!userId) {
        res.status(400);
        logger.warn('Campos sin completar.');
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
        logger.error(`Usuario no encontrado: ${dencryptedId}`);
        throw new Error('Usuario no encontrado.');
    }
});

export {
    createUser,
    getUsers,
    getUserRoles,
    loginUser,
    logoutUser,
    updateUserPassword,
    forgotUserPassword,
    getUserClearPassword,
    userProfile,
    updateUserProfile,
    profileUser,
    updateProfileUser,
    lockUser,
    unlockUser,
}