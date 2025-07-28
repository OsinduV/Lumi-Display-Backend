import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage configuration for Product Images
const productImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Product Images',
    public_id: (req, file) => {
      const productName = req.body.productName || req.body.name || 'unknown-product';
      const timestamp = Date.now();
      return `${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;
    },
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
  }
});

// Storage configuration for Spec Sheets
const specSheetStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Spec Sheets',
    public_id: (req, file) => {
      const productName = req.body.productName || req.body.name || 'unknown-product';
      const fileName = req.body.specSheetName || file.originalname.split('.')[0];
      const timestamp = Date.now();
      return `${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;
    },
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto' // Automatically detect file type
  }
});

// Storage configuration for Brand Images
const brandImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Brand Images',
    public_id: (req, file) => {
      const brandName = req.body.brandName || req.body.name || 'unknown-brand';
      const timestamp = Date.now();
      return `${brandName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;
    },
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg']
  }
});

// Multer configurations
export const uploadProductImages = multer({ 
  storage: productImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const uploadSpecSheets = multer({ 
  storage: specSheetStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  }
});

export const uploadBrandImages = multer({ 
  storage: brandImageStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for brand logos
  }
});

// Direct upload functions for programmatic use
export const uploadToCloudinary = {
  // Upload product image
  productImage: async (file, productName) => {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: 'Product Images',
        public_id: `${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
      });
      return result;
    } catch (error) {
      throw new Error(`Product image upload failed: ${error.message}`);
    }
  },

  // Upload spec sheet
  specSheet: async (file, productName, fileName) => {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: 'Spec Sheets',
        public_id: `${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
        resource_type: 'auto'
      });
      return result;
    } catch (error) {
      throw new Error(`Spec sheet upload failed: ${error.message}`);
    }
  },

  // Upload brand image
  brandImage: async (file, brandName) => {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: 'Brand Images',
        public_id: `${brandName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
      });
      return result;
    } catch (error) {
      throw new Error(`Brand image upload failed: ${error.message}`);
    }
  }
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

export default cloudinary;
