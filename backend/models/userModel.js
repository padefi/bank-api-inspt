import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const governmentIdTypes = ['cuil', 'cuit', 'dni', 'pas'];

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        minlength: 6,
        required: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
        default: '000000000000000000000002'
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true
    },
    firstName: {
        type: String,
        lowercase: true,
        required: true
    },
    lastName: {
        type: String,
        lowercase: true,
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    governmentId: {
        type: {
            type: String,
            enum: governmentIdTypes
        },
        number: {
            type: String,
            trim: true,
            unique: true
        }
    },
    bornDate: {
        type: Date
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true
});

// Encriptado de la contraseña
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;