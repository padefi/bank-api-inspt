import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const governmentIdTypes = ['cuil', 'cuit', 'dni', 'lc', 'le', 'pas'];

const userSchema = mongoose.Schema({
    email: {
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
    /*role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
        default: 'cliente'
    },*/
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
    /*governmentId: {
        type: {
            type: String,
            enum: governmentIdTypes
        },
        number: {
            type: String,
            trim: true
        }
    },*/
    bornDate: {
        type: Date
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

const User = mongoose.model('User', userSchema);

export default User;