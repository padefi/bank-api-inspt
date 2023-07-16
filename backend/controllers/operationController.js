import asyncHandler from "express-async-handler";
import Account from "../models/accountModel.js";
import Operation from "../models/operationModel.js"
import { isAdmin, isCustomer, isEmployee } from "../middlewares/authMiddleware.js";
import { extendToken } from "../utils/generateToken.js";
import { decrypt } from "../utils/crypter.js";

// @desc    Visualizar operaciones
// @route   GET /api/operations/allOperations
// @access  Private
const getAllOperations = asyncHandler(async (req, res) => {

    const { id, accountFrom } = req.query;

    const dencryptedId = await decrypt(accountFrom);
    const dencryptedOperationId = await decrypt(id);

    // Validación
    if (!dencryptedOperationId || !dencryptedId) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const operations = await Operation.findOne({ _id: dencryptedOperationId }).populate([
        {
            path: 'accountFrom',
            select: 'accountId',
            populate: [
                {
                    path: 'accountHolder',
                    select: 'firstName lastName governmentId',
                }
            ]
        },
        {
            path: 'accountTo',
            select: 'accountId',
            populate: [
                {
                    path: 'accountHolder',
                    select: 'firstName lastName governmentId',
                }
            ]
        }
    ]);

    if (!operations) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    let description;

    if (operations.type === 'deposito') {
        description = 'Deposito. ' + operations.description;
    } else if (operations.type === 'extraccion') {
        description = 'Extraccion. ' + operations.description;
    } else {
        description = operations.description;
    }

    let amount = (operations.accountFrom._id.toString() === dencryptedId) ? operations.amountFrom : operations.amountTo;
    if (operations.type === 'extraccion') amount *= -1;
    else if (operations.type === 'deposito') amount = operations.amountTo;
    else if (operations.type === 'transferencia' && operations.accountTo._id.toString() !== dencryptedId) amount *= -1;

    let holderDataFrom = '';
    if (operations.type === 'transferencia') {
        holderDataFrom = (operations.accountFrom._id.toString() === dencryptedId)
            ? ' - ' + operations.accountFrom.accountHolder.governmentId.type + ': ' + operations.accountFrom.accountHolder.governmentId.number
            : ' - ' + operations.accountTo.accountHolder.governmentId.type + ': ' + operations.accountTo.accountHolder.governmentId.number
    }

    extendToken(req, res);
    res.status(201).json({
        operationDate: operations.operationDate,
        type: operations.type,
        amount,
        holderDataFrom,
        description,
    });
});

// @desc    Visualizar operaciones de una cuenta
// @route   GET /api/operations/accountOperations
// @access  Private
const getAccountOperations = asyncHandler(async (req, res) => {

    const { accountFrom, dateFrom, dateTo, operationType } = req.query;

    const dencryptedId = await decrypt(accountFrom);

    // Validación
    if (!accountFrom) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const query = Account.findOne({ _id: dencryptedId }).select('-_id accountId type currency accountBalance').populate('currency', '-_id acronym symbol');

    const matchConditions = {};
    const startDate = (dateFrom) ? new Date(new Date(dateFrom).getTime() + new Date().getTimezoneOffset() * 60000) : '';
    const endDate = (dateTo) ? new Date(new Date(dateTo).getTime() + new Date().getTimezoneOffset() * 540000) : '';

    if (dateFrom || dateTo) {
        matchConditions.operationDate = {};
        if (dateFrom) {
            matchConditions.operationDate.$gte = startDate;
        }
        if (dateTo) {
            matchConditions.operationDate.$lte = endDate;
        }
    }

    if (operationType && operationType !== 'null') {
        matchConditions.type = operationType;
    }

    query.populate({
        path: 'operations',
        populate: {
            path: '_id',
            match: matchConditions,
            populate: [
                {
                    path: 'accountFrom',
                    select: 'accountId',
                    populate: {
                        path: 'accountHolder',
                        select: 'firstName lastName governmentId',
                    },
                },
                {
                    path: 'accountTo',
                    select: 'accountId',
                    populate: {
                        path: 'accountHolder',
                        select: 'firstName lastName governmentId',
                    },
                },
            ],
        },
    });

    const account = await query.exec();

    if (!account) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    const operationDataArray = [];

    account.operations.forEach(operation => {
        if (operation._id) {
            let description;

            if (operation._id.type === 'deposito') {
                description = 'Deposito. ' + operation._id.description;
            } else if (operation._id.type === 'extraccion') {
                description = 'Extraccion. ' + operation._id.description;
            } else {
                description = operation._id.description;
            }

            let amount = (operation._id.accountFrom._id.toString() === dencryptedId) ? operation._id.amountFrom : operation._id.amountTo;
            if (operation._id.type === 'extraccion') amount *= -1;
            else if (operation._id.type === 'deposito') amount = operation._id.amountTo;
            else if (operation._id.type === 'transferencia' && operation._id.accountTo._id.toString() !== dencryptedId) amount *= -1;

            let holderDataFrom = '';
            if (operation._id.type === 'transferencia') {
                holderDataFrom = (operation._id.accountFrom._id.toString() === dencryptedId)
                    ? ' - ' + operation._id.accountFrom.accountHolder.governmentId.type + ': ' + operation._id.accountFrom.accountHolder.governmentId.number
                    : ' - ' + operation._id.accountTo.accountHolder.governmentId.type + ': ' + operation._id.accountTo.accountHolder.governmentId.number
            }

            const operationData = {
                operationDate: operation._id.operationDate,
                type: operation._id.type,
                amount,
                holderDataFrom,
                description,
                balance: operation.balanceSnapshot
            };

            operationDataArray.push(operationData);
        }
    });

    extendToken(req, res);
    res.status(201).json({
        accountId: account.accountId,
        type: account.Type,
        accountBalance: account.accountBalance,
        currency: account.currency,
        operationDataArray
    });
});

// @desc    Realizar una extracción de dinero
// @route   POST /api/operations/deposit
// @access  Private
const depositMoney = asyncHandler(async (req, res) => {
    const { accountId, amount } = req.body;

    // Validación
    if (!accountId || !amount) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    if (amount <= 0) {
        res.status(400);
        throw new Error('El monto a depositar debe ser mayor a cero.');
    }

    const dencryptedId = await decrypt(accountId);

    const accountFrom = await Account.findOne(isAdmin(req.user) || isEmployee(req.user) ? { _id: dencryptedId } : { _id: dencryptedId, accountHolder: req.user._id });

    if (!accountFrom) {
        res.status(403);
        throw new Error('Sin autorización.');
        //throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (!accountFrom.isActive) {
        res.status(400);
        throw new Error(`La cuenta no se encuentra activa.`);
    }

    let description = '';

    let amountFrom, amountTo, tax; amountFrom = amountTo = Number(amount); tax = 0;

    if (accountFrom.type == 'CC') {
        tax = amount * 0.005;
        amountTo -= tax;
        description = `Esta operación tiene un impuesto del 0.5% (importe: ${tax})`
    }

    const operation = await Operation.create({
        type: 'deposito',
        accountFrom: dencryptedId,
        amountFrom,
        amountTo,
        operationDate: new Date(),
        description
    });

    if (operation) {

        const newBalanceFrom = accountFrom.accountBalance + amountTo;
        const roundedBalanceFrom = Number(newBalanceFrom.toFixed(2));
        accountFrom.accountBalance = roundedBalanceFrom;
        accountFrom.operations.push({
            _id: operation._id,
            balanceSnapshot: roundedBalanceFrom
        });

        await accountFrom.save();

        extendToken(req, res);
        res.status(200).json({
            message: 'Deposito realizado con exito.',
            date: operation.operationDate,
            amountFrom,
            amountTo,
            tax,
        });

    } else {
        res.status(400);
        throw new Error('Ha ocurrido un error al realizar el depósito');
    }
});

// @desc    Realizar una extracción de dinero
// @route   POST /api/operations/withdraw
// @access  Private
const withdrawMoney = asyncHandler(async (req, res) => {
    const { accountId, amount } = req.body;

    // Validación
    if (!accountId || !amount) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    if (amount <= 0) {
        res.status(400);
        throw new Error('El monto a extraer debe ser mayor a cero.');
    }

    const dencryptedId = await decrypt(accountId);

    const accountFrom = await Account.findOne(isAdmin(req.user) || isEmployee(req.user) ? { _id: dencryptedId } : { _id: dencryptedId, accountHolder: req.user._id });

    if (!accountFrom) {
        res.status(403);
        throw new Error('Sin autorización.');
        //throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (!accountFrom.isActive) {
        res.status(400);
        throw new Error(`La cuenta no se encuentra activa.`);
    }

    if (accountFrom.accountBalance < amount) {
        res.status(400);
        throw new Error(`La cuenta no dispone de fondo suficiente para realizar la extracción.`);
    }

    let description = '';

    let amountFrom, amountTo, tax; amountFrom = amountTo = Number(amount); tax = 0;

    if (accountFrom.type == 'CC') {
        tax = amount * 0.005;
        amountFrom += tax;
        description = `Esta operación tiene un impuesto del 0.5% (importe: ${tax})`
    }

    const operation = await Operation.create({
        type: 'extraccion',
        accountFrom: dencryptedId,
        amountFrom,
        amountTo,
        operationDate: new Date(),
        description
    });

    if (operation) {

        const newBalanceFrom = accountFrom.accountBalance - amountFrom;
        const roundedBalanceFrom = Number(newBalanceFrom.toFixed(2));
        accountFrom.accountBalance = roundedBalanceFrom;
        accountFrom.operations.push({
            _id: operation._id,
            balanceSnapshot: roundedBalanceFrom
        });

        await accountFrom.save();

        extendToken(req, res);
        res.status(200).json({
            message: 'Extracción realizada con exito.',
            date: operation.operationDate,
            amountFrom,
            amountTo,
            tax,
        });

    } else {
        res.status(400);
        throw new Error('Ha ocurrido un error al realizar la extracción.');
    }
});

// @desc    Realizar una transferencia de dinero
// @route   POST /api/operations/transfer
// @access  Private
const transferMoney = asyncHandler(async (req, res) => {

    const { accountFromId, accountTo, amount } = req.body;
    let description = req.body.description;

    // Validación
    if (!accountFromId || !accountTo || !amount || !description) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const dencryptedId = await decrypt(accountFromId);

    const accountFrom = await Account.findOne(isAdmin(req.user) || isEmployee(req.user) ? { _id: dencryptedId } : { _id: dencryptedId, accountHolder: req.user._id }).populate('currency', '-_id acronym symbol');

    if (!accountFrom) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (!accountFrom.isActive) {
        res.status(400);
        throw new Error(`La cuenta ${accountFrom.accountId} no se encuentra activa.`);
    }

    if (accountFrom.accountBalance < amount) {
        res.status(400);
        throw new Error(`La cuenta ${accountFrom.accountId} no dispone de fondo suficiente para realizar la transferencia.`);
    }

    const accountToData = await Account.findOne({
        $or: [
            { accountId: accountTo },
            { alias: accountTo }
        ], isActive: true
    }).populate('currency', '-_id acronym symbol');

    if (!accountToData) {
        res.status(404);
        throw new Error('La cuenta no ha sido encontrada.');
    }

    if (accountFrom.accountId === accountToData.accountId) {
        res.status(400);
        throw new Error('No puede realizarse una transferencia a la misma cuenta.');
    }

    if (accountFrom.currency.acronym !== accountToData.currency.acronym) {
        res.status(400);
        throw new Error('La operación no puede realizarse ya que las cuentas no son de la misma moneda.');
    }

    let amountFrom, amountTo, tax; amountFrom = amountTo = Number(amount); tax = 0;

    if (accountFrom.accountHolder.toString() != accountToData.accountHolder.toString() && (accountFrom.type == 'CC' || accountToData.type == 'CC')) {
        tax = amount * 0.005;
        if (accountToData.type == 'CA') amountFrom += tax;
        else if (accountToData.type == 'CC') amountTo = amount - tax;
        description += `. Esta operación tiene un impuesto del 0.5% (importe: ${tax})`
    }

    const operation = await Operation.create({
        type: 'transferencia',
        accountFrom: dencryptedId,
        accountTo: accountToData._id,
        amountFrom,
        amountTo,
        operationDate: new Date(),
        description
    });

    if (operation) {

        const newBalanceFrom = accountFrom.accountBalance - amountFrom;
        const roundedBalanceFrom = Number(newBalanceFrom.toFixed(2));
        accountFrom.accountBalance = roundedBalanceFrom;
        accountFrom.operations.push({
            _id: operation._id,
            balanceSnapshot: roundedBalanceFrom
        });

        const newBalanceTo = accountToData.accountBalance + amountTo;
        const roundedBalanceTo = Number(newBalanceTo.toFixed(2));
        accountToData.accountBalance = roundedBalanceTo;
        accountToData.operations.push({
            _id: operation._id,
            balanceSnapshot: roundedBalanceTo
        });

        await Promise.all([accountFrom.save(), accountToData.save()]);

        extendToken(req, res);
        res.status(200).json({
            message: 'Transferencia realizada con exito.',
            date: operation.operationDate,
            amountFrom,
            amountTo,
            tax,
        });

    } else {
        res.status(400);
        throw new Error('Ha ocurrido un error al realizar la transferencia.');
    }
});

export {
    getAllOperations,
    getAccountOperations,
    withdrawMoney,
    depositMoney,
    transferMoney
}