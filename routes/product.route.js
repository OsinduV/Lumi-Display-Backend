import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  bulkCreateProducts,
  bulkUpdateProducts
} from '../controllers/product.controller.js';

const router = express.Router();

// Bulk operations
router.post('/bulk', bulkCreateProducts);
router.put('/bulk', bulkUpdateProducts);

// Individual operations
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
