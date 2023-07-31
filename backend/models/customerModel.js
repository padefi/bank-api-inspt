import mongoose from "mongoose";
import AutoIncrement from "./autoIncrementModel.js";

const customerTypes = ['PC', 'BC']; // PC Personal Customer - BC Business Customer

const customerSchema = mongoose.Schema(
  {
    number: {
      type: Number,
      unique: true
    },
    type: {
      type: String,
      required: true,
      enum: customerTypes
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

customerSchema.pre('save', async function (next) {
  if (this.isNew) {
    const autoIncrement = await AutoIncrement.findOneAndUpdate(
      { model: 'Customer', field: 'number' },
      { $inc: { next: 1 } },
      { new: true, upsert: true }
    );
    this.number = autoIncrement.next.toString().padStart(6, '0');
  }
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;