import asyncHandler from "express-async-handler";
import Account from "../models/accountModel.js";
import Currency from "../models/currencyModel.js";

// @desc    Cración de una operación
// @route   POST /api/operation/new
// @access  Private
const createOperation = asyncHandler(async (req, res) => {

    const { accountFrom, accountTo, amountFrom, amountTo } = req.body;

    // Validación
    if (!accountFrom || !accountTo || !amountFrom || !amountTo) {
        res.status(400);
        throw new Error('Por favor, complete todos los campos.');
    }

    if (accountFrom === accountTo) {
        res.status(400);
        throw new Error('No puede realizarse una transferencia a la misma cuenta.');
    }

    const sourceAccount = await Account.findOne({ _id: accountFrom, accountHolder: req.user._id }).populate('currency');

    if (!sourceAccount) {
        res.status(403);
        throw new Error('Sin autorización. La cuenta no pertenece al usuario logueado.');
    }
});

export {
    createOperation
}