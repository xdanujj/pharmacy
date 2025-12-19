import asyncHandler from 'express-async-handler';
import Medicine from '../models/Medicine.js';

// @desc    Add new medicine
// @route   POST /api/medicines
// @access  Private
export const addMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.create({
    ...req.body,
    user: req.user._id,
  });

  res.status(201).json(medicine);
});

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
export const getMedicines = asyncHandler(async (req, res) => {
  const { search, category, lowStock } = req.query;

  let query = { user: req.user._id };

  // Search by name
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  const medicines = await Medicine.find(query).sort({ createdAt: -1 });

  // Filter low stock items
  let result = medicines;
  if (lowStock === 'true') {
    result = medicines.filter((med) => med.quantity <= med.reorderLevel);
  }

  res.json({
    count: result.length,
    medicines: result,
  });
});

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Private
export const getMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  // Check ownership
  if (medicine.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.json(medicine);
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private
export const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  // Check ownership
  if (medicine.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedMedicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(updatedMedicine);
});

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private
export const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  // Check ownership
  if (medicine.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await medicine.deleteOne();

  res.json({ message: 'Medicine removed' });
});