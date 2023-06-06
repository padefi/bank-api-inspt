import mongoose from "mongoose"

const currencySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    acronym: {
        type: String,
        uppercase: true,
        trim: true,
        unique: true,
        required: true
    },
    symbol: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true
    },
    currentReferenceToUSD: {
        type: Number,
        required: true
    },
});

const Currency = mongoose.model('Currency', currencySchema);

export default Currency;