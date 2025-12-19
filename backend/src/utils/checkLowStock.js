import Medicine from '../models/Medicine.js';

const checkLowStock = async (userId) => {
  const lowStockMedicines = await Medicine.find({
    user: userId,
    $expr: { $lte: ['$quantity', '$reorderLevel'] },
  });

  return lowStockMedicines;
};

export default checkLowStock;