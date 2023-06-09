import asyncHandler from "express-async-handler";
import Account from "../models/accountModel.js";
import Currency from "../models/currencyModel.js";
import { extendToken } from "../utils/generateToken.js";
import User from "../models/userModel.js";
import { generateAlias, generateCBU } from "../utils/generateAccountInfo.js";
import { isAdmin, isClient } from "../middlewares/authMiddleware.js";

// @desc    Crear cuenta bancaria
// @route   POST /api/accounts/create
// @access  Private
const createAccount = asyncHandler(async (req, res) => {

    const { userId, accountType, currencyId } = req.body;

    // Validación
    if (!isAdmin(req.user)) {
        res.status(403);
        throw new Error('Sin autorización.');
    }

    if (!userId || !accountType || !currencyId) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }

    const currency = await Currency.findById(currencyId);

    if (!currency) {
        res.status(404);
        throw new Error('Tipo de moneda encontrada.');
    }

    const accountExist = await Account.findOne({ accountHolder: userId, type: accountType, currency: currencyId });

    if (accountExist) {
        res.status(400);
        throw new Error('El cliente ya posee la cuenta que se le intenta crear.');
    }

    let cbu = generateCBU(accountType);
    let alias = generateAlias(user.firstName, user.lastName, accountType, currency.acronym);

    let cbuAndAliasExist = await Account.findOne({
        $or: [
            { accountId: cbu },
            { alias }
        ]
    });

    if (cbuAndAliasExist) {
        cbu = generateCBU(accountType);
        alias = generateAlias(user.governmentId.number, user.lastName, accountType, currency.acronym);
    }

    const account = await Account.create({
        accountId: cbu,
        type: accountType,
        alias,
        accountHolder: userId,
        currency: currency._id
    });

    if (account) {
        extendToken(req, res);
        res.status(201).json({
            message: 'Cuenta creada con exito.',
            account
        });

    } else {
        res.status(400);
        throw new Error('Ha ocurrido un error al crear la cuenta.');
    }
});

export {
    createAccount
}