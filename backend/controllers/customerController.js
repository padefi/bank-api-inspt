import asyncHandler from "express-async-handler";
import Account from "../models/accountModel.js";
import Currency from "../models/currencyModel.js";
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

export {
    getCustomer,
}