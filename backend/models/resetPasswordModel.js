import mongoose from "mongoose"

const resetPasswordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "user",
    },
    token: {
        type: String,
        required: true,
    },
    expirationTime: {
        type: Date,
        required: true,
        index: {
            expires: '0'
        }
    },
},{
    timestamps: true
});

resetPasswordSchema.index(
    { expirationTime: 1 },
    { expireAfterSeconds: 30 }
);

const ResetPassword = mongoose.model('ResetPassword', resetPasswordSchema);

export default ResetPassword;