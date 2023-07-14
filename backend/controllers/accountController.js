import asyncHandler from "express-async-handler";
import Account from "../models/accountModel.js";
import Currency from "../models/currencyModel.js";
import { extendToken } from "../utils/generateToken.js";
import User from "../models/userModel.js";
import { generateAlias, generateAccountId } from "../utils/generateAccountInfo.js";
import { isAdmin, isCustomer, isEmployee } from "../middlewares/authMiddleware.js";
import { decrypt, encrypt } from "../utils/crypter.js";

// @desc    Ver cuentas bancarias
// @route   GET /api/accounts/
// @access  Private
const getUserAccounts = asyncHandler(async (req, res) => {

    const { id } = req.query;

    if ((isEmployee(req.user) || isAdmin(req.user)) && !id) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const dencryptedId = await decrypt(id);

    let accounts = await Account.find(isEmployee(req.user) || isAdmin(req.user) ? { accountHolder: dencryptedId } : { accountHolder: req.user._id })
        .select('accountBalance accountId alias isActive operations type _id')
        .populate('currency', '-_id acronym symbol');

    if (!accounts) {
        res.status(403);
        throw new Error('Sin autorización.');
        //throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    accounts = await Promise.all(accounts.map(async (account) => {
        const encryptedId = await encrypt(account._id.toHexString());
        const operations = await Promise.all(account.operations.map(async (operation) => {
            const encryptedOperationsId = await encrypt(operation._id.toHexString());
            return { ...operation.toObject(), _id: encryptedOperationsId };
        }));
        return { ...account.toObject(), _id: encryptedId, operations };
    }));

    extendToken(req, res);
    res.status(201).json({
        accounts
    });
});

// @desc    Ver cuenta bancaria determinada
// @route   GET /api/accounts/
// @access  Private
const getUserAccount = asyncHandler(async (req, res) => {

    const { id } = req.query;

    if (!id) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const dencryptedId = await decrypt(id);

    const account = await Account.findOne({ _id: dencryptedId, accountHolder: req.user._id })
        .select('-_id accountBalance accountId alias isActive type')
        .populate('currency', '-_id acronym symbol');

    if (!account) {
        res.status(403);
        throw new Error('Sin autorización.');
        //throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    extendToken(req, res);
    res.status(201).json({
        account
    });
});

// @desc    Busca cuenta bancaria para transferencia
// @route   GET /api/accounts/
// @access  Private
const getAccount = asyncHandler(async (req, res) => {

    const { data } = req.query;

    // Validación
    if (!data) {
        res.status(400);
        throw new Error('Por favor, complete uno de los campos.');
    }

    const accounts = await Account.findOne({
        $or: [
            { accountId: data },
            { alias: data }
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
});

// @desc    Obtener los tipo de monedas
// @route   POST /api/accounts/currencies
// @access  Private
const getCurrencies = asyncHandler(async (req, res) => {

    const currency = await Currency.find();

    if (currency) {
        res.status(201).json({
            currency
        });

    } else {
        res.status(400);
        throw new Error('Ha ocurrido un error al obtener los tipos de monedas.');
    }
});

// @desc    Crear cuenta bancaria
// @route   POST /api/accounts/create
// @access  Private
const createAccount = asyncHandler(async (req, res) => {

    const { accountType, currencyId } = req.body;

    if (!accountType || !currencyId) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }

    const currency = await Currency.findById(currencyId);

    if (!currency) {
        res.status(404);
        throw new Error('Tipo de moneda encontrada.');
    }

    if (accountType === 'CC' && currency.acronym === 'USD') {
        res.status(400);
        throw new Error('No es posible crear el tipo de cuenta con la moneda indicada');
    }

    const accountExist = await Account.findOne({ accountHolder: req.user._id, type: accountType, currency: currencyId });

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
        accountHolder: req.user._id,
        currency: currency._id
    });

    if (account) {
        extendToken(req, res);
        res.status(201).json({
            message: 'Cuenta creada con exito.',
        });

    } else {
        res.status(400);
        throw new Error('Ha ocurrido un error al crear la cuenta.');
    }
});

// @desc    Cambiar Alias cuenta bancaria
// @route   PUT /api/accounts/changeAlias
// @access  Private
const changeAlias = asyncHandler(async (req, res) => {

    const { accountId, alias } = req.body;

    // Validación
    if (!accountId || !alias) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    if (!alias.match(/^[0-9a-zA-Z.]{6,20}$/)) {
        res.status(400);
        throw new Error('El Alias debe tener entre 6 y 20 caracteres alfanuméricos.');
    }

    const dencryptedId = await decrypt(accountId);

    const account = await Account.findOne({ _id: dencryptedId, accountHolder: req.user._id });

    if (!account) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (!account.isActive) {
        res.status(400);
        throw new Error(`La cuenta no se encuentra activa.`);
    }

    let aliasExist = await Account.findOne({ alias });
    if (aliasExist) {
        res.status(400);
        throw new Error('El Alias ya existe.');
    }

    account.alias = alias;

    const updateAccount = await account.save();

    if (updateAccount) {
        extendToken(req, res);
        res.status(201).json({
            message: 'Alias modificado con exito.'
        });
    } else {
        res.status(404);
        throw new Error('Cuenta no encontrada.');
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

    const dencryptedId = await decrypt(accountId);

    const account = await Account.findOne(isAdmin(req.user) || isEmployee(req.user) ? { _id: dencryptedId } : { _id: dencryptedId, accountHolder: req.user._id });

    if (!account) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (!account.isActive) {
        res.status(400);
        throw new Error(`La cuenta no se encuentra activa.`);
    }

    if (account.accountBalance > 0 && !isAdmin(req.user)) {
        res.status(400);
        throw new Error(`Para poder cerrar la cuenta no debe tener saldo disponible.`);
    }

    account.isActive = false;

    const updateAccount = await account.save();

    if (updateAccount) {
        extendToken(req, res);
        res.status(201).json({
            message: 'Cuenta cerrada con exito.',
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

    const dencryptedId = await decrypt(accountId);

    const account = await Account.findOne(isAdmin(req.user) || isEmployee(req.user) ? { _id: dencryptedId } : { _id: dencryptedId, accountHolder: req.user._id });

    if (!account) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (account.isActive) {
        res.status(400);
        throw new Error(`La cuenta se encuentra activa.`);
    }

    account.isActive = true;

    const updateAccount = await account.save();

    if (updateAccount) {
        extendToken(req, res);
        res.status(201).json({
            message: 'Cuenta activada con exito.'
        });
    } else {
        res.status(404);
        throw new Error('Cuenta no encontrada.');
    }
});

export {
    getUserAccounts,
    getUserAccount,
    getAccount,
    createAccount,
    getCurrencies,
    changeAlias,
    closeAccount,
    activeAccount
}