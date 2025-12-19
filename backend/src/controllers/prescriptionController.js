import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Prescription from '../models/Prescription.js';
import Medicine from '../models/Medicine.js';

/* =====================================
   CREATE PRESCRIPTION (Doctor → Pharmacy)
===================================== */
export const createPrescription = asyncHandler(async (req, res) => {
  const { patientName, patientAge, patientPhone, doctorName, items, notes } =
    req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('Prescription must contain items');
  }

  let totalAmount = 0;
  const processedItems = [];

  for (const item of items) {
    const medicine = await Medicine.findOne({
      name: { $regex: new RegExp(`^${item.medicineName}$`, 'i') },
      user: req.user._id,
    });

    if (!medicine) {
      processedItems.push({
        medicine: null,
        medicineName: item.medicineName,
        quantity: item.quantity,
        dosage: item.dosage,
        available: false,
      });
      continue;
    }

    const isAvailable = medicine.quantity >= item.quantity;

    processedItems.push({
      medicine: medicine._id,
      medicineName: medicine.name,
      quantity: item.quantity,
      dosage: item.dosage,
      available: isAvailable,
    });

    if (isAvailable) {
      totalAmount += medicine.price * item.quantity;
    }
  }

  const allAvailable = processedItems.every((i) => i.available);
  const noneAvailable = processedItems.every((i) => !i.available);

  let status = 'pending';
  if (allAvailable) status = 'processing';
  else if (!noneAvailable) status = 'partial';

  const prescription = await Prescription.create({
    patientName,
    patientAge,
    patientPhone,
    doctorName,
    items: processedItems,
    status,
    totalAmount,
    notes,
    user: req.user._id,
  });

  res.status(201).json(prescription);
});

/* ===============================
   GET ALL PRESCRIPTIONS
================================ */
export const getPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find()
    .populate('items.medicine')
    .sort({ createdAt: -1 });

  res.json({
    count: prescriptions.length,
    prescriptions,
  });
});

/* ===============================
   GET SINGLE PRESCRIPTION
================================ */
export const getPrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id).populate(
    'items.medicine'
  );

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  res.json(prescription);
});

/* ===============================
   COMPLETE PRESCRIPTION
================================ */
export const completePrescription = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const prescription = await Prescription.findById(req.params.id).session(
      session
    );

    if (!prescription) {
      res.status(404);
      throw new Error('Prescription not found');
    }

    if (prescription.status === 'completed') {
      res.status(400);
      throw new Error('Prescription already completed');
    }

    for (const item of prescription.items) {
      if (item.available && item.medicine) {
        const medicine = await Medicine.findById(item.medicine).session(
          session
        );

        if (!medicine || medicine.quantity < item.quantity) {
          res.status(400);
          throw new Error(`Insufficient stock for ${item.medicineName}`);
        }

        medicine.quantity -= item.quantity;
        await medicine.save({ session });
      }
    }

    prescription.status = 'completed';
    await prescription.save({ session });

    await session.commitTransaction();
    res.json(prescription);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/* ===============================
   UPDATE PRESCRIPTION STATUS
================================ */
export const updatePrescriptionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  prescription.status = status;
  await prescription.save();

  res.json(prescription);
});
