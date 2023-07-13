import asyncHandler from "express-async-handler";
import { extendToken } from "../utils/generateToken.js";
import { isAdmin, isEmployee } from "../middlewares/authMiddleware.js";
import { decrypt, encrypt } from "../utils/crypter.js";
import Role from "../models/roleModel.js";
import Customer from "../models/customerModel.js";
import User from "../models/userModel.js";

// @desc    Ver clients
// @route   GET /api/customer/
// @access  Private
const getCustomer = asyncHandler(async (req, res) => {

    if (!isAdmin(req.user) && !isEmployee(req.user)) {
        res.status(400);
        throw new Error('Sin autorización.');
    }

    const role = await Role.findOne({ name: 'cliente' });

    if (!role) {
        res.status(404);
        throw new Error('Rol no encontrado');
    }

    let customers = await Customer.find()
        .select('-_id number type')
        .populate('user', '_id bornDate email firstName governmentId lastName phone isActive');

    customers = await Promise.all(customers.map(async (customer) => {
        const encryptedId = await encrypt(customer.user._id.toHexString());
        const updatedUser = { ...customer.user.toObject(), _id: encryptedId };
        return { ...customer.toObject(), user: updatedUser };
    }));

    extendToken(req, res);
    res.status(201).json({
        customers
    });
});

// @desc    Ver clients
// @route   GET /api/customer/profile
// @access  Private
const getCustomerProfile = asyncHandler(async (req, res) => {

    const { id } = req.query

    // Validación
    if (!id) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const dencryptedId = await decrypt(id);

    if (!isAdmin(req.user) && !isEmployee(req.user)) {
        res.status(400);
        throw new Error('Sin autorización.');
    }

    let customer = await Customer.findOne({ user: dencryptedId })
        .select('-_id number type')
        .populate('user', '-_id bornDate email firstName governmentId lastName phone isActive');

    if (!customer) {
        res.status(404);
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

    const { userId, governmentIdType, governmentId, customerType, firstName, lastName, bornDate, email, phoneNumber } = req.body

    if (!isAdmin(req.user) && !isEmployee(req.user)) {
        res.status(400);
        throw new Error('Sin autorización.');
    }

    const dencryptedId = await decrypt(userId);

    const user = await User.findById(dencryptedId);
    const customer = await Customer.findOne({ user: dencryptedId })

    if (user && customer) {
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
        throw new Error('Usuario no encontrado.');
    }
});

export {
    getCustomer,
    getCustomerProfile,
    updateCustomerProfile,
}