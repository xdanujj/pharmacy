import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add medicine name'],
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add category'],
      enum: ['tablet', 'syrup', 'injection', 'ointment', 'drops', 'other'],
    },
    manufacturer: {
      type: String,
      required: [true, 'Please add manufacturer'],
    },
    batchNumber: {
      type: String,
      required: [true, 'Please add batch number'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please add expiry date'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please add quantity'],
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: 0,
    },
    price: {
      type: Number,
      required: [true, 'Please add price'],
      min: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for fast searching
medicineSchema.index({ name: 1, user: 1 });
medicineSchema.index({ expiryDate: 1 });

export default mongoose.model('Medicine', medicineSchema);