import express from 'express';
import {
  createPrescription,
  getPrescriptions,
  getPrescription,
  completePrescription,
  updatePrescriptionStatus,
} from '../controllers/prescriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create + list prescriptions
router
  .route('/')
  .post(protect, createPrescription)
  .get(protect, getPrescriptions);

// Get single prescription
router.route('/:id').get(protect, getPrescription);

// Complete prescription (deduct inventory)
router.route('/:id/complete').post(protect, completePrescription);

// Update prescription status
router.route('/:id/status').put(protect, updatePrescriptionStatus);

export default router;
