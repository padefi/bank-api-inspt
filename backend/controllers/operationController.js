import asyncHandler from "express-async-handler";
import Account from "../models/accountModel.js";
import Currency from "../models/currencyModel.js";
import Operation from "../models/operationModel.js"
import { isAdmin, isClient } from "../middlewares/authMiddleware.js";
import { extendToken } from "../utils/generateToken.js";

// @desc    Visualizar operaciones de una cuenta
// @route   GET /api/operations/transfer
// @access  Private
const getOperations = asyncHandler(async (req, res) => {

    const { accountId } = req.body;

    //const accountFrom = await Account.findOne(isAdmin(req.user) ? { _id: accountId } : { _id: accountId, accountHolder: req.user._id }).populate('operations');
    const operations = await Operation.find({
        $or: [
            { accountFrom: accountId },
            { accountTo: accountId }
        ]
    })
        .populate([
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

    extendToken(req, res);
    res.status(201).json({
        operations
    });
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

    const accountFrom = await Account.findOne({ _id: accountId, accountHolder: req.user._id });

    if (!accountFrom) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (!accountFrom.isActive) {
        res.status(400);
        throw new Error(`La cuenta ${accountId} no se encuentra activa.`);
    }

    if (accountFrom.accountBalance < amount) {
        res.status(400);
        throw new Error(`La cuenta ${accountId} no dispone de fondo suficiente para realizar la extracción.`);
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
        accountFrom: accountId,
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

// @desc    Realizar una extracción de dinero
// @route   POST /api/operations/withdraw
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

    const accountFrom = await Account.findOne({ _id: accountId, accountHolder: req.user._id });

    if (!accountFrom) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (!accountFrom.isActive) {
        res.status(400);
        throw new Error(`La cuenta ${accountId} no se encuentra activa.`);
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
        accountFrom: accountId,
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
            operation
        });

    } else {
        res.status(400);
        throw new Error('Ha ocurrido un error al realizar el depósito');
    }
});

// @desc    Realizar una transferencia de dinero
// @route   POST /api/operations/transfer
// @access  Private
const transferMoney = asyncHandler(async (req, res) => {

    const { accountFromId, accountToId, amount } = req.body;
    let description = req.body.description;

    // Validación
    if (!accountFromId || !accountToId || !amount) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    if (accountFromId === accountToId) {
        res.status(400);
        throw new Error('No puede realizarse una transferencia a la misma cuenta.');
    }

    const accountFrom = await Account.findOne({ _id: accountFromId, accountHolder: req.user._id }).populate('currency');

    if (!accountFrom) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }

    if (!accountFrom.isActive) {
        res.status(400);
        throw new Error(`La cuenta ${accountFromId} no se encuentra activa.`);
    }

    if (accountFrom.accountBalance < amount) {
        res.status(400);
        throw new Error(`La cuenta ${accountFromId} no dispone de fondo suficiente para realizar la transferencia.`);
    }

    const accountTo = await Account.findById(accountToId).populate('currency');

    if (!accountTo) {
        res.status(404);
        throw new Error('La cuenta no ha sido encontrada.');
    }

    if (!accountTo.isActive) {
        res.status(400);
        throw new Error(`La cuenta ${accountToId} no se encuentra activa.`);
    }

    if (accountFrom.currency.acronym != accountTo.currency.acronym) {
        res.status(400);
        throw new Error('La operación no puede realizarse ya que las cuentas no son de la misma moneda.');
    }

    let amountFrom, amountTo; amountFrom = amountTo = Number(amount);

    if (accountFrom.accountHolder.toString() != accountTo.accountHolder.toString() && (accountFrom.type == 'CC' || accountTo.type == 'CC')) {
        const tax = amount * 0.005;
        if (accountTo.type == 'CA') amountFrom += tax;
        else if (accountTo.type == 'CC') amountTo = amount - tax;
        description += `. Esta operación tiene un impuesto del 0.5% (importe: ${tax})`
    }

    const operation = await Operation.create({
        type: 'transferencia',
        accountFrom: accountFromId,
        accountTo: accountToId,
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

        const newBalanceTo = accountTo.accountBalance + amountTo;
        const roundedBalanceTo = Number(newBalanceTo.toFixed(2));
        accountTo.accountBalance = roundedBalanceTo;
        accountTo.operations.push({
            _id: operation._id,
            balanceSnapshot: roundedBalanceTo
        });

        await Promise.all([accountFrom.save(), accountTo.save()]);

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
    getOperations,
    withdrawMoney,
    depositMoney,
    transferMoney
}