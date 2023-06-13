import mongoose from "mongoose";

const userSessionSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    sessionID: {
        type: String,
        default: null
    },
    expirationTime: {
        type: Date,
        required: true,
        index: {
            expires: '0'
        }
    },
});

userSessionSchema.index(
    { expirationTime: 1 },
    { expireAfterSeconds: 10 }
);

const UserSession = mongoose.model('UserSession', userSessionSchema);

export default UserSession;