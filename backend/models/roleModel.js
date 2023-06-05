import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    name: {
        type: String, 
        lowercase: true, 
        trim: true, 
        unique: true,
        required: true 
    },
});

const Role = mongoose.model('Role', roleSchema);

export default Role;
