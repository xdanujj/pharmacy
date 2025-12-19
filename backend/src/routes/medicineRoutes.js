import express from 'express';
import {
  addMedicine,
  getMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
} from '../controllers/medicineController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addMedicine).get(protect, getMedicines);

router
  .route('/:id')
  .get(protect, getMedicine)
  .put(protect, updateMedicine)
  .delete(protect, deleteMedicine);

export default router;