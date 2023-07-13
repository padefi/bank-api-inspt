import asyncHandler from "express-async-handler";
import { extendToken } from "../utils/generateToken.js";
import { isAdmin, isEmployee } from "../middlewares/authMiddleware.js";
import { decrypt, encrypt } from "../utils/crypter.js";
import Role from "../models/roleModel.js";
import Customer from "../models/customerModel.js";

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

export {
    getCustomer,
    getCustomerProfile,
    updateCustomerProfile,
}