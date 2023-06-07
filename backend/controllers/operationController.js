import asyncHandler from "express-async-handler";
import Account from "../models/accountModel.js";
import Currency from "../models/currencyModel.js";
import Operation from "../models/operationModel.js"

// @desc    Realizar una transferencia de dinero
// @route   POST /api/operation/new
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
        res.status(403);
        throw new Error(`La cuenta ${accountFromId} no se encuentra activa.`);
    }

    if (accountFrom.accountBalance < amount) {
        res.status(400);
        throw new Error(`La cuenta ${accountFromId} no dispone de fondo suficiente para realizar la operación.`);
    }

    const accountTo = await Account.findById(accountToId).populate('currency');

    if (!accountTo) {
        res.status(404);
        throw new Error('La cuenta no ha sido encontrada.');
    }

    if (!accountTo.isActive) {
        res.status(403);
        throw new Error(`La cuenta ${accountToId} no se encuentra activa.`);
    }

    if (accountFrom.currency.acronym != accountTo.currency.acronym) {
        res.status(400);
        throw new Error('La operación no puede realizarse ya que las cuentas no son de la misma moneda.');
    }

    let amountFrom, amountTo; amountFrom = amountTo = Number(amount);
    console.log();
    if (accountFrom.accountHolder.toString() != accountTo.accountHolder.toString() && (accountFrom.type == 'CC' || accountTo.type == 'CC')) {
        const tax = amount * 0.005;
        if (accountTo.type == 'CA') amountFrom += tax;
        else if (accountTo.type == 'CC') amountTo = amount - tax;
        description += `. Esta operación tiene un impuesto del 0.5% (importe: ${tax})`
    }

    const operation = await Operation.create({
        accountFrom: accountFromId,
        accountTo: accountToId,
        amountFrom,
        amountTo,
        operationDate: new Date(),
        description
    });

    if (operation) {

        accountFrom.accountBalance -= amountFrom;
        accountFrom.operations.push({
            _id: operation.id,
            to: accountToId,
            amount: amount
        });

        accountTo.accountBalance += amountTo;
        accountTo.operations.push({
            _id: operation.id,
            from: accountFromId,
            amount: amount
        });

        await Promise.all([accountFrom.save(), accountTo.save()]);

        res.status(200).json({
            message: 'Operación realizada con exito.',
            operation
        });

    } else {
        res.status(400);
        throw new Error('Ha ocurrido un error al realizar la operación.');
    }
});

export {
    transferMoney
}