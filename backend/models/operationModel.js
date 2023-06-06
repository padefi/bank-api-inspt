import mongoose from "mongoose";

const operationSchema = new mongoose.Schema({
    accountFrom: {
        type: ObjectId,
        ref: 'Account',
        required: true
    },
    accountTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    amountFrom: {
        type: Number,
        min: 10,
        required: true
    },
    amountTo: {
        type: Number,
        min: 10,
        required: true
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