import asyncHandler from "express-async-handler";
import { extendToken } from "../utils/generateToken.js";
import { isAdmin, isEmployee } from "../middlewares/authMiddleware.js";
import { decrypt, encrypt } from "../utils/crypter.js";
import Role from "../models/roleModel.js";
import Customer from "../models/customerModel.js";
import User from "../models/userModel.js";
import logger from '../utils/logger.js';

// @desc    Crear un nuevo cliente
// @route   POST /api/users/create
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
    logger.info(`createCustomer por el usuario: ${req.user._id}`);

    const { governmentIdType, governmentId, customerType, lastName, firstName, bornDate, email, phoneNumber } = req.body;

    if (!isAdmin(req.user) && !isEmployee(req.user)) {
        res.status(400);
        logger.warn(`Usuario no autorizado: ${req.user._id}`);
        throw new Error('Sin autorización.');
    }

    // Validación
    if (!governmentIdType || !governmentId || !customerType || !lastName || !firstName || !bornDate || !email || !phoneNumber) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    const userName = governmentId;
    const governmentIdBD = {
        type: governmentIdType,
        number: governmentId
    }

    const CustomerExists = await User.findOne({
        $or: [
            { userName },
            { email }
        ]
    });

    if (CustomerExists) {
        res.status(400);
        if (CustomerExists.userName === userName) {
            logger.warn(`Cliente ya registrado: ${userName}.`);
            throw new Error('Cliente ya registrado.');
        } else {
            logger.warn(`Email ya registrado: ${email}.`);
            throw new Error('Email ya registrado.');
        }
    }

    const user = await User.create({
        userName,
        email,
        password: userName,
        firstName,
        lastName,
        phone: phoneNumber,
        governmentId: governmentIdBD,
        bornDate
    });

    const customer = await Customer.create({
        type: customerType,
        user: user._id
    });

    if (!customer) {
        await User.deleteOne({ _id: user._id });
        res.status(400);
        logger.error(`Ha ocurrido un error al crear al cliente.`);
        throw new Error('Ha ocurrido un error al crear al cliente.');
    }

    if (user && customer) {
        extendToken(req, res);
        res.status(201).json({
            message: 'Cliente creado con exito.'
        });
    } else {
        res.status(400);
        logger.error(`Ha ocurrido un error al crear al cliente.`);
        throw new Error('Información invalida.');
    }
});

// @desc    Ver clients
// @route   GET /api/customer/
// @access  Private
const getCustomer = asyncHandler(async (req, res) => {
    logger.info(`getCustomer por el usuario: ${req.user._id}`);

    const { accountHolder, governmentId, customerTypes, accountStatus } = req.query;

    if (!isAdmin(req.user) && !isEmployee(req.user)) {
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

    let query = { user: { $ne: '000000000000000000000000' } };
    let matchConditions = [];

    if (customerTypes !== '' && customerTypes !== 'null') {
        query.type = customerTypes;
    }

    if (accountHolder || governmentId || (accountStatus !== '' && accountStatus !== 'null')) {
        const conditions = [];

        if (governmentId) {
            conditions.push({ 'governmentId.number': { $regex: new RegExp(governmentId, 'i') } });
        }

        if (accountHolder) {
            conditions.push({
                $or: [
                    { 'firstName': { $regex: new RegExp(accountHolder, 'i') } },
                    { 'lastName': { $regex: new RegExp(accountHolder, 'i') } },
                ]
            });
        }

        if ((accountStatus !== '' && accountStatus !== 'null')) {
            conditions.push({ 'isActive': accountStatus === 'true' });
        }

        if (conditions.length > 0) {
            matchConditions.push({ $and: conditions });
        }
    }


    let customers = await Customer.find(query)
        .select('-_id number type')
        .populate({
            path: 'user',
            match: matchConditions.length > 0 ? { $and: matchConditions } : undefined,
            select: {
                _id: 1,
                bornDate: 1,
                email: 1,
                firstName: 1,
                lastName: 1,
                governmentId: 1,
                phone: 1,
                isActive: 1,
            },
        });

    if (!customers) {
        res.status(403);
        logger.error('Clientes no encontrados.');
        throw new Error('No se encontraron clientes.');
    }

    let newCustomers = customers.filter((customer) => customer.user !== null);

    newCustomers = await Promise.all(newCustomers.map(async (customer) => {
        const encryptedId = await encrypt(customer.user._id.toHexString());
        const updatedUser = { ...customer.user.toObject(), _id: encryptedId };
        return { ...customer.toObject(), user: updatedUser };
    }));

    extendToken(req, res);
    res.status(201).json({
        customers: newCustomers
    });
});

// @desc    Ver clients
// @route   GET /api/customer/profile
// @access  Private
const getCustomerProfile = asyncHandler(async (req, res) => {
    logger.info(`getCustomerProfile por el usuario: ${req.user._id}`);

    const { id } = req.query

    // Validación
    if (!id) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    const dencryptedId = await decrypt(id);

    if (!isAdmin(req.user) && !isEmployee(req.user)) {
        res.status(400);
        logger.warn(`Usuario no autorizado: ${req.user._id}`);
        throw new Error('Sin autorización.');
    }

    let customer = await Customer.findOne({ user: dencryptedId })
        .select('-_id number type')
        .populate('user', '-_id userName bornDate email firstName governmentId lastName phone isActive');

    if (!customer) {
        res.status(404);
        logger.error('Cliente no encontrado.');
        throw new Error('Cliente no encontrado.');
    }

    extendToken(req, res);
    res.status(201).json({
        customer
    });
});

// @desc    Actualizar datos del cliente
// @route   PUT /api/customer/profile
// @access  Private
const updateCustomerProfile = asyncHandler(async (req, res) => {
    logger.info(`updateCustomerProfile por el usuario: ${req.user._id}`);

    const { userId, governmentIdType, governmentId, customerType, firstName, lastName, bornDate, email, phoneNumber } = req.body

    if (!isAdmin(req.user) && !isEmployee(req.user)) {
        res.status(400);
        logger.warn(`Usuario no autorizado: ${req.user._id}`);
        throw new Error('Sin autorización.');
    }

    const dencryptedId = await decrypt(userId);

    const user = await User.findById(dencryptedId);
    const customer = await Customer.findOne({ user: dencryptedId })

    if (user && customer) {
        
        user.userName = governmentId || user.userName;
        user.email = email || user.email;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phone = phoneNumber || user.phone;
        user.governmentId.type = governmentIdType || user.governmentId.type;
        user.governmentId.number = governmentId || user.governmentId.number;
        user.bornDate = bornDate || user.bornDate;

        customer.type = customerType || customer.type;

        const updateUser = await user.save();
        const updateCustomer = await customer.save();

        extendToken(req, res);
        res.json({
            message: 'Cliente actualizado con éxito.'
        });
    } else {
        res.status(404);
        logger.error('Clientes no encontrados.');
        throw new Error('Usuario no encontrado.');
    }
});

export {
    createCustomer,
    getCustomer,
    getCustomerProfile,
    updateCustomerProfile,
}