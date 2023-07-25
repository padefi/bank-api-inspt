import asyncHandler from "express-async-handler";
import Account from "../models/accountModel.js";
import Currency from "../models/currencyModel.js";
import { extendToken } from "../utils/generateToken.js";
import User from "../models/userModel.js";
import { generateAlias, generateAccountId } from "../utils/generateAccountInfo.js";
import { isAdmin, isCustomer, isEmployee } from "../middlewares/authMiddleware.js";
import { decrypt, encrypt } from "../utils/crypter.js";
import logger from '../utils/logger.js';

// @desc    Ver cuentas bancarias
// @route   GET /api/accounts/
// @access  Private
const getAllAccounts = asyncHandler(async (req, res) => {
    logger.info(`getAllAccounts por el usuario: ${req.user._id}`);

    const { accountType, currencyId, governmentId, dataAccount } = req.query;

    if (isCustomer(req.user)) {
        res.status(403);
        logger.warn(`Usuario no autorizado: ${req.user._id}`);
        throw new Error('Sin autorización.');
    }

    let query = {};
    const matchConditionsGovernmentId = [];

    if (accountType !== 'null' || currencyId !== 'null' || dataAccount) {

        if (accountType !== 'null') {
            query.type = accountType;
        }

        if (currencyId !== 'null') {
            query.currency = currencyId;
        }

        if (dataAccount) {
            query.$or = [];
            query.$or.push({
                $or: [
                    { 'accountId': { $regex: dataAccount, $options: 'i' } },
                    { 'alias': { $regex: dataAccount, $options: 'i' } },
                ]
            });
        }

        if (dataAccount) {
            query.$or.push({ dataAccount: { $regex: dataAccount, $options: 'i' } });
        }
    }

    if (governmentId) {
        matchConditionsGovernmentId.push({
            $or: [
                { 'governmentId.number': { $regex: governmentId, $options: 'i' } },
                { 'firstName': { $regex: governmentId, $options: 'i' } },
                { 'lastName': { $regex: governmentId, $options: 'i' } }
            ]
        });
    }

    let accounts = await Account.find(query)
        .select('accountBalance accountId alias isActive type _id')
        .populate('currency', '-_id acronym symbol')
        .populate({
            path: 'accountHolder',
            match: matchConditionsGovernmentId.length > 0 ? { $and: matchConditionsGovernmentId } : undefined,
            select: {
                _id: 0,
                firstName: 1,
                lastName: 1,
                governmentId: 1,
            },
        });

    if (!accounts) {
        res.status(403);
        logger.warn(`Cuentas no encontradas`);
        throw new Error('No se encontraron cuentas.');
    }

    let newAccounts = accounts.filter((account) => account.accountHolder !== null);

    newAccounts = await Promise.all(newAccounts.map(async (account) => {
        const encryptedId = await encrypt(account._id.toHexString());
        return { ...account.toObject(), _id: encryptedId };
    }));

    extendToken(req, res);
    res.status(201).json({
        accounts: newAccounts
    });
});

// @desc    Ver cuentas bancarias
// @route   GET /api/accounts/ && /api/accounts/getCustomerAccount
// @access  Private
const getUserAccounts = asyncHandler(async (req, res) => {
    logger.info(`getUserAccounts por el usuario: ${req.user._id}`);

    const { id } = req.query;

    if ((isEmployee(req.user) || isAdmin(req.user)) && !id) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    const dencryptedId = isEmployee(req.user) || isAdmin(req.user) ? await decrypt(id) : req.user._id;

    let accounts = await Account.find({ accountHolder: dencryptedId })
        .select('accountBalance accountId alias isActive operations type _id')
        .populate('currency', '-_id acronym symbol');

    if (!accounts) {
        res.status(403);
        logger.warn(`Cuenta no encontrada: ${dencryptedId}`);
        throw new Error('Sin autorización.');
        //throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    let newAccounts = accounts;

    newAccounts = await Promise.all(newAccounts.map(async (account) => {
        const encryptedId = await encrypt(account._id.toHexString());
        const operations = await Promise.all(account.operations.map(async (operation) => {
            const encryptedOperationsId = await encrypt(operation._id.toHexString());
            return { ...operation.toObject(), _id: encryptedOperationsId };
        }));
        return { ...account.toObject(), _id: encryptedId, operations };
    }));

    extendToken(req, res);
    res.status(201).json({
        accounts: newAccounts,
    });
});

// @desc    Ver cuenta bancaria determinada
// @route   GET /api/accounts/
// @access  Private
const getUserAccount = asyncHandler(async (req, res) => {
    logger.info(`getUserAccount por el usuario: ${req.user._id}`);

    const { id } = req.query;

    if (!id) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    const dencryptedId = await decrypt(id);

    const account = await Account.findOne({ _id: dencryptedId, accountHolder: req.user._id })
        .select('-_id accountBalance accountId alias isActive type')
        .populate('currency', '-_id acronym symbol');

    if (!account) {
        res.status(403);
        logger.warn(`Usuario no autorizado: ${req.user._id}`);
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
    logger.info(`getAccount por el usuario: ${req.user._id}`);

    const { data } = req.query;

    // Validación
    if (!data) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete uno de los campos.');
    }

    const accounts = await Account.findOne({
        $or: [
            { accountId: data },
            { alias: data }
        ], isActive: true
    }).select({
        _id: isCustomer(req.user) ? 0 : 1,
        accountId: 1,
        alias: 1,
        type: 1,
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
            acronym: 1,
            symbol: 1,
        },
    });

    if (!accounts) {
        res.status(404);
        logger.warn('Cuenta no encontrada.');
        throw new Error('Cuenta no encontrada.');
    }

    let newAccounts = accounts;

    if (newAccounts._id) {
        const currentId = newAccounts._id.toHexString();
        const encryptedId = await encrypt(currentId);
        newAccounts = { ...newAccounts.toObject(), _id: encryptedId };
    }

    extendToken(req, res);
    res.status(201).json({
        accounts: newAccounts,
    });
});

// @desc    Obtener los tipo de monedas
// @route   POST /api/accounts/currencies
// @access  Private
const getCurrencies = asyncHandler(async (req, res) => {
    logger.info(`getCurrencies por el usuario: ${req.user._id}`);

    const currency = await Currency.find();

    if (currency) {
        res.status(201).json({
            currency
        });

    } else {
        res.status(400);
        logger.error('Ha ocurrido un error al obtener los datos.');
        throw new Error('Ha ocurrido un error al obtener los tipos de monedas.');
    }
});

// @desc    Crear cuenta bancaria
// @route   POST /api/accounts/create
// @access  Private
const createAccount = asyncHandler(async (req, res) => {
    logger.info(`createAccount por el usuario: ${req.user._id}`);

    const { accountType, currencyId } = req.body;

    if (!isAdmin(req.user) && !isEmployee(req.user)) {
        res.status(400);
        logger.warn(`Usuario no autorizado: ${req.user._id}`);
        throw new Error('Sin autorización.');
    }

    const userId = (isCustomer(req.user)) ? req.user._id : await decrypt(req.body.userId);

    if (!userId || !accountType || !currencyId) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        logger.error(`Usuario no encontrado: ${userId}`);
        throw new Error('Usuario no encontrado.');
    }

    const currency = await Currency.findById(currencyId);

    if (!currency) {
        res.status(404);
        logger.error('Ha ocurrido un error al obtener los datos.');
        throw new Error('Tipo de moneda encontrada.');
    }

    if (accountType === 'CC' && currency.acronym === 'USD') {
        res.status(400);
        logger.warn('Cuentas seleccionada en un tipo de moneda no permitida.');
        throw new Error('No es posible crear el tipo de cuenta con la moneda indicada');
    }

    const accountExist = await Account.findOne({ accountHolder: userId, type: accountType, currency: currencyId });

    if (accountExist) {
        res.status(400);
        logger.warn(`El cliente ${userId} ya posee la cuenta.`);
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
        });

    } else {
        res.status(400);
        logger.error(`Ha ocurrido un error al crear la cuenta del usuario: ${userId}`);
        throw new Error('Ha ocurrido un error al crear la cuenta.');
    }
});

// @desc    Cambiar Alias cuenta bancaria
// @route   PUT /api/accounts/changeAlias
// @access  Private
const changeAlias = asyncHandler(async (req, res) => {
    logger.info(`changeAlias por el usuario: ${req.user._id}`);

    const { accountId, alias } = req.body;

    // Validación
    if (!accountId || !alias) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    if (!alias.match(/^[0-9a-zA-Z.]{6,20}$/)) {
        res.status(400);
        logger.warn('El campo no cumple con los requisitos.');
        throw new Error('El Alias debe tener entre 6 y 20 caracteres alfanuméricos.');
    }

    const dencryptedId = await decrypt(accountId);

    const account = await Account.findOne({ _id: dencryptedId, accountHolder: req.user._id });

    if (!account) {
        res.status(403);
        logger.warn(`Cuenta no encontrada: ${dencryptedId}`);
        throw new Error('Sin autorización.');
        //throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (!account.isActive) {
        res.status(400);
        logger.warn(`Cuenta ${dencryptedId} no activa.`);
        throw new Error(`La cuenta no se encuentra activa.`);
    }

    let aliasExist = await Account.findOne({ alias });
    if (aliasExist) {
        res.status(400);
        logger.warn(`Alias de la cuenta ${dencryptedId} ya registrado.`);
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
        logger.error(`Error al actualizar el Alias de la cuenta: ${dencryptedId}`);
        throw new Error('Error al actualizar el Alias.');
    }
});

// @desc    Cerrar cuenta bancaria
// @route   POST /api/accounts/close
// @access  Private
const closeAccount = asyncHandler(async (req, res) => {
    logger.info(`closeAccount por el usuario: ${req.user._id}`);

    const { accountId } = req.body

    // Validación
    if (!accountId) {
        res.status(400);
        logger.warn('Campos sin completar.');
        throw new Error('Por favor, complete todos los campos.');
    }

    const dencryptedId = await decrypt(accountId);

    const account = await Account.findOne(isAdmin(req.user) || isEmployee(req.user) ? { _id: dencryptedId } : { _id: dencryptedId, accountHolder: req.user._id });

    if (!account) {
        res.status(403);
        logger.warn(`Cuenta no encontrada: ${dencryptedId}`);
        throw new Error('Sin autorización.');
        //throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (!account.isActive) {
        res.status(400);
        logger.warn(`Cuenta ${dencryptedId} no activa.`);
        throw new Error(`La cuenta no se encuentra activa.`);
    }

    if (account.accountBalance > 0 && !isAdmin(req.user)) {
        res.status(400);
        logger.warn(`No es posible cerrar la Cuenta ${dencryptedId}`);
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
        logger.error(`Error al cerrar la cuenta: ${dencryptedId}`);
        throw new Error('Error al cerrar la cuenta.');
    }
});

// @desc    Activar cuenta bancaria
// @route   POST /api/accounts/active
// @access  Private
const activeAccount = asyncHandler(async (req, res) => {
    logger.info(`activeAccount por el usuario: ${req.user._id}`);

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
        logger.warn(`Cuenta no encontrada: ${dencryptedId}`);
        throw new Error('Sin autorización.');
        //throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (account.isActive) {
        res.status(400);
        logger.warn(`No es posible activar la Cuenta ${dencryptedId}`);
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
        logger.error(`Error al activar la cuenta: ${dencryptedId}`);
        throw new Error('Error al activar la cuenta.');
    }
});

export {
    getAllAccounts,
    getUserAccounts,
    getUserAccount,
    getAccount,
    createAccount,
    getCurrencies,
    changeAlias,
    closeAccount,
    activeAccount
}