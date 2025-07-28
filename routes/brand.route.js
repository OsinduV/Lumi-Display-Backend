import express from 'express';
import {
  createBrand,
  createBrandWithImage,
  getAllBrands,
  getBrandById,
  updateBrand,
  updateBrandWithImage,
  deleteBrand
} from '../controllers/brand.controller.js';
import { uploadBrandImages } from '../config/cloudinary.js';

const router = express.Router();

// Brand routes with file upload
router.post('/with-image', uploadBrandImages.single('image'), createBrandWithImage);
router.put('/:id/with-image', uploadBrandImages.single('image'), updateBrandWithImage);

// Regular brand routes
router.post('/', createBrand);
router.get('/', getAllBrands);
router.get('/:id', getBrandById);
router.put('/:id', updateBrand);
router.delete('/:id', deleteBrand);

export default router;
