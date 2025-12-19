import mongoose from 'mongoose';

const prescriptionItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: false, // 🔥 CHANGED
  },
  medicineName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  dosage: {
    type: String,
  },
  available: {
    type: Boolean,
    default: false,
  },
});

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: String,
      unique: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientAge: {
      type: Number,
      required: true,
    },
    patientPhone: {
      type: String,
    },
    doctorName: {
      type: String,
      required: true,
    },
    items: [prescriptionItemSchema],
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'partial', 'cancelled'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate prescription ID
prescriptionSchema.pre('save', async function (next) {
  if (!this.prescriptionId) {
    this.prescriptionId = `RX${Date.now()}`;
  }
  next();
});

export default mongoose.model('Prescription', prescriptionSchema);
