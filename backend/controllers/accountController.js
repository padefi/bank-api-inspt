import asyncHandler from "express-async-handler";
import Account from "../models/accountModel.js";
import Currency from "../models/currencyModel.js";
import { extendToken } from "../utils/generateToken.js";
import User from "../models/userModel.js";
import { generateAlias, generateAccountId } from "../utils/generateAccountInfo.js";
import { isAdmin, isClient } from "../middlewares/authMiddleware.js";

// @desc    Ver cuentas bancarias
// @route   GET /api/accounts/show
// @access  Private
const getUserAccounts = asyncHandler(async (req, res) => {

    const { userId } = req.body;

    if (isAdmin(req.user) && !userId) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const accounts = await Account.find(isAdmin(req.user) ? { accountHolder: userId } : { accountHolder: req.user._id }).populate('currency');

    if (!accounts) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    extendToken(req, res);
    res.status(201).json({
        accounts
    });
});

const getAccount = asyncHandler(async (req, res) => {

    const { accountId, alias } = req.body;

    // Validación
    if (!accountId && !alias) {
        res.status(400);
        throw new Error('Por favor, complete uno de los campos.');
    }

    const accounts = await Account.findOne({
        $or: [
            { accountId },
            { alias }
        ], isActive: true
    }).select({
        _id: 0,
        accountId: 1,
        alias: 1
    }).populate({
        path: 'accountHolder',
        select: {
            _id: 0,
            firstName: 1,
            lastName: 1,
            governmentId: 1,
        },
    }).populate({
        path: 'currency',
        select: {
            _id: 0,
            initials: 1,
            name: 1,
        },
    });

    if (!accounts) {
        res.status(404);
        throw new Error('Cuenta no encontrada.');
    }

    extendToken(req, res);
    res.status(201).json({
        accounts
    });
})

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

    let accountId = generateAccountId(accountType);
    let alias = generateAlias(user.firstName, user.lastName, accountType, currency.acronym);

    let accountIdAndAliasExist = await Account.findOne({
        $or: [
            { accountId },
            { alias }
        ]
    });

    do {

        if (accountIdAndAliasExist) {
            accountId = generateAccountId(accountType);
            alias = generateAlias(user.governmentId.number, user.lastName, accountType, currency.acronym);
        }

        accountIdAndAliasExist = await Account.findOne({
            $or: [
                { accountId },
                { alias }
            ]
        });

    } while (accountIdAndAliasExist);

    const account = await Account.create({
        accountId,
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

// @desc    Cerrar cuenta bancaria
// @route   POST /api/accounts/close
// @access  Private
const closeAccount = asyncHandler(async (req, res) => {

    const { accountId } = req.body

    // Validación
    if (!accountId) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const account = await Account.findOne({ _id: accountId, accountHolder: req.user._id });

    if (!account) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (!account.isActive) {
        res.status(400);
        throw new Error(`La cuenta ${accountId} no se encuentra activa.`);
    }

    if (account.accountBalance > 0) {
        res.status(400);
        throw new Error(`Para poder cerrar la cuenta ${accountId} no debe tener saldo disponible.`);
    }

    account.isActive = false;

    const updateAccount = await account.save();

    if (updateAccount) {
        extendToken(req, res);
        res.status(201).json({
            message: 'Cuenta cerrada con exito.',
            _id: updateAccount._id

        });
    } else {
        res.status(404);
        throw new Error('Cuenta no encontrada.');
    }
});

// @desc    Activar cuenta bancaria
// @route   POST /api/accounts/active
// @access  Private
const activeAccount = asyncHandler(async (req, res) => {

    const { accountId } = req.body

    // Validación
    if (!accountId) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const account = await Account.findOne({ _id: accountId, accountHolder: req.user._id });

    if (!account) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (account.isActive) {
        res.status(400);
        throw new Error(`La cuenta ${accountId} se encuentra activa.`);
    }

    account.isActive = true;

    const updateAccount = await account.save();

    if (updateAccount) {
        extendToken(req, res);
        res.status(201).json({
            message: 'Cuenta activada con exito.',
            _id: updateAccount._id

        });
    } else {
        res.status(404);
        throw new Error('Cuenta no encontrada.');
    }
});

export {
    getUserAccounts,
    getAccount,
    createAccount,
    closeAccount,
    activeAccount
}