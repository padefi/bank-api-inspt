import asyncHandler from "express-async-handler";
import Account from "../models/accountModel.js";
import Currency from "../models/currencyModel.js";

// @desc    Cración de una operación
// @route   POST /api/operation/new
// @access  Private
const createOperation = asyncHandler(async (req, res) => {

    const { accountFromId, accountToId, amountFrom, amountTo } = req.body;

    // Validación
    if (!accountFromId || !accountToId || !amountFrom || !amountTo) {
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

    if (accountFrom.accountBalance < amountFrom) {
        res.status(400);
        throw new Error(`La cuenta ${accountFromId} no dispone de fondo suficiente para realizar la operación.`);
    }

    const accountTo = await Account.findById(accountToId).populate('currency');

    if (!accountTo) {
        res.status(404);
        throw new Error('La cuenta no ha sido encontrada.');
    }

    if (accountFrom.initials != accountTo.initials) {
        res.status(400);
        throw new Error('La operación no puede realizarse ya que las cuentas no son de la misma moneda.');
    }

    if (accountFrom.accountHolder.toString() != accountTo.accountHolder.toString()) {
        // TODO
    }
});

export {
    createOperation
}