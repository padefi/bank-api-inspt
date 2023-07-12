import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";

const protect = asyncHandler(async (req, res, next) => {
    let token;

    token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.userId).select('-password').populate('role');

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Sin autorización, token invalido.');
        }
    } else {
        res.status(401);
        throw new Error('Sin autorización, sin token.');
    }
});

const isAdmin = (user) => {
    return user.role && user.role.name === 'admin';
};

const isEmployee = (user) => {
    return user.role && user.role.name === 'empleado';
}

const isClient = (user) => {
    return user.role && user.role.name === 'cliente';
}

const loginIsClient = (user) => {
    return user === 'cliente';
}

export {
    protect,
    isAdmin,
    isEmployee,
    isClient,
    loginIsClient
}