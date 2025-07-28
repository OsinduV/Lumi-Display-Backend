import express from 'express';
import { 
  createCategory, 
  getAllCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory,
  getParentCategories,
  getSubcategories,
  getCategoryTree
} from '../controllers/category.controller.js';

const router = express.Router();

// Category routes
router.post('/', createCategory);
router.get('/', getAllCategories);
router.get('/parents', getParentCategories);  // Get only parent categories
router.get('/tree', getCategoryTree);         // Get tree structure
router.get('/:id', getCategoryById);
router.get('/:parentId/subcategories', getSubcategories);  // Get subcategories of a parent
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;