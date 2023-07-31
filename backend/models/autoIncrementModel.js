import mongoose from "mongoose";

const autoIncrementSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true
    },
    field: {
        type: String,
        required: true
    },
    next: {
        type: Number,
        required: true,
        default: 1
    }
}, {
    timestamps: true
});

const AutoIncrement = mongoose.model('AutoIncrement', autoIncrementSchema);

export default AutoIncrement;