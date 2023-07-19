import mongoose from "mongoose";

const operationTypes = ['extraccion', 'deposito', 'transferencia'];

const operationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: operationTypes
    },
    accountFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    accountTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    amountFrom: {
        type: Number,
        min: 0.01,
        required: true
    },
    amountTo: {
        type: Number,
        min: 0.01
    },
    operationDate: {
        type: Date,
        default: new Date()
    },
    description: {
        type: String
    }
});

operationSchema.index({ accountFrom: 1 });
operationSchema.index({ accountTo: 1 });
operationSchema.index({ operationDate: -1 });

const Operation = mongoose.model('Operation', operationSchema);

export default Operation;