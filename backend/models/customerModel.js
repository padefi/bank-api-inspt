import mongoose from "mongoose";

const customerTypes = ['PC', 'BC']; // PC Personal Customer - BC Business Customer

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
});

const AutoIncrement = mongoose.model('AutoIncrement', autoIncrementSchema);

const customerSchema = mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
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