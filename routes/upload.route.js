import express from 'express';
import { 
  uploadProductImages, 
  uploadSpecSheets, 
  uploadBrandImages,
  deleteFromCloudinary 
} from '../config/cloudinary.js';

const router = express.Router();

// Upload product images (multiple files)
router.post('/product-images', uploadProductImages.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const uploadedImages = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
      original_name: file.originalname
    }));

    res.status(200).json({
      message: 'Product images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload spec sheets (multiple files)
router.post('/spec-sheets', uploadSpecSheets.array('specSheets', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No spec sheets uploaded' });
    }

    const uploadedSpecSheets = req.files.map(file => file.path);

    res.status(200).json({
      message: 'Spec sheets uploaded successfully',
      specSheets: uploadedSpecSheets
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload brand image (single file)
router.post('/brand-image', uploadBrandImages.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No brand image uploaded' });
    }

    const uploadedImage = {
      url: req.file.path,
      public_id: req.file.filename,
      original_name: req.file.originalname
    };

    res.status(200).json({
      message: 'Brand image uploaded successfully',
      image: uploadedImage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete file from Cloudinary
router.delete('/delete/:public_id', async (req, res) => {
  try {
    const { public_id } = req.params;
    const { resource_type = 'image' } = req.query;

    const result = await deleteFromCloudinary(public_id, resource_type);
    
    if (result.result === 'ok') {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
