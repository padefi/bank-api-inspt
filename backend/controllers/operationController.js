import asyncHandler from "express-async-handler";
import Account from "../models/accountModel.js";
import Currency from "../models/currencyModel.js";
import Operation from "../models/operationModel.js"
import { isAdmin, isClient } from "../middlewares/authMiddleware.js";
import { extendToken } from "../utils/generateToken.js";
import { decrypt } from "../utils/crypter.js";

// @desc    Visualizar operaciones de una cuenta
// @route   GET /api/operations/allOperations
// @access  Private
const getAllOperations = asyncHandler(async (req, res) => {

    const { id, accountFrom } = req.query;    

    const dencryptedId = await decrypt(accountFrom);

    // Validación
    if (!id || !dencryptedId) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const operations = await Operation.findOne({ _id: id }).populate([
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

    let amountFrom = operations.amountFrom;
    if(operations.type === 'extraccion') amountFrom *= -1;
    else if(operations.type === 'transferencia' && operations.accountTo._id.toString() !== dencryptedId) amountFrom *= -1;

    extendToken(req, res);
    res.status(201).json({
        idOperation: operations._id,
        operationDate: operations.operationDate,
        type: operations.type,
        amountFrom,
        holderDataFrom: (operations.type === 'transferencia') ? ' - ' + operations.accountFrom.accountHolder.governmentId.type + ': ' + operations.accountFrom.accountHolder.governmentId.number : '',
        description,
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

    const accountFrom = await Account.findOne({ _id: dencryptedId, accountHolder: req.user._id });

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

    let amountFrom, amountTo; amountFrom = amountTo = Number(amount);

    if (accountFrom.type == 'CC') {
        const tax = amount * 0.005;
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

    const accountFrom = await Account.findOne({ _id: dencryptedId, accountHolder: req.user._id });

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

    let amountFrom, amountTo; amountFrom = amountTo = Number(amount);

    if (accountFrom.type == 'CC') {
        const tax = amount * 0.005;
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
            operation
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
    if (!accountFromId || !accountTo || !amount) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    const dencryptedId = await decrypt(accountFromId);

    const accountFrom = await Account.findOne({ _id: dencryptedId, accountHolder: req.user._id }).populate('currency');

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
    }).populate('currency');

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

    let amountFrom, amountTo; amountFrom = amountTo = Number(amount);

    if (accountFrom.accountHolder.toString() != accountToData.accountHolder.toString() && (accountFrom.type == 'CC' || accountToData.type == 'CC')) {
        const tax = amount * 0.005;
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
            operation
        });

    } else {
        res.status(400);
        throw new Error('Ha ocurrido un error al realizar la transferencia.');
    }
});

export {
    getAllOperations,
    withdrawMoney,
    depositMoney,
    transferMoney
}