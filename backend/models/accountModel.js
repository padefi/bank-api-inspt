import mongoose from "mongoose";

const accountTypes = ['CA', 'CC'];

const accountSchema = mongoose.Schema({
    accountId: {
        type: String,
        unique: true,
        required: true
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    alias: {
        type: String,
        required: true
    },
    accountHolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountBalance: {
        type: Number,
        required: true,
        default: 0
    },
    operations: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Operation',
            required: true
        },
        balanceSnapshot: {
            type: Number,
            required: true
        }
    }],
    currency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Currency',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
});

accountSchema.index({ accountHolder: 1 });
accountSchema.index({ accountHolder: 1, currency: 1 }, { unique: true });
/*accountSchema.index({
    alias: 1
}, {
    unique: true,
    partialFilterExpression: {
        alias: {
            $type: 'string'
        }
    }
});*/

const Account = mongoose.model('Account', accountSchema);

export default Account;