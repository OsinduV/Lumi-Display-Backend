import Product from '../models/product.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// CREATE product with image and spec sheet upload
export const createProductWithUploads = async (req, res) => {
  try {
    const productData = req.body;
    const uploadedImages = [];
    const uploadedSpecSheets = [];

    // Handle image uploads if files are provided
    if (req.files && req.files.images) {
      for (const imageFile of req.files.images) {
        const uploadResult = await uploadToCloudinary.productImage(
          imageFile.path,
          productData.name
        );
        uploadedImages.push(uploadResult.secure_url);
      }
    }

    // Handle spec sheet uploads if files are provided
    if (req.files && req.files.specSheets) {
      for (const specFile of req.files.specSheets) {
        const uploadResult = await uploadToCloudinary.specSheet(
          specFile.path,
          productData.name,
          specFile.originalname
        );
        uploadedSpecSheets.push(uploadResult.secure_url);
      }
    }

    // Create product with uploaded files
    const product = new Product({
      ...productData,
      images: uploadedImages,
      specSheets: uploadedSpecSheets
    });

    const saved = await product.save();
    await saved.populate(['category', 'brand', 'tags']);

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// UPDATE product with new uploads
export const updateProductWithUploads = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    
    // Get existing product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let newImages = [...(existingProduct.images || [])];
    let newSpecSheets = [...(existingProduct.specSheets || [])];

    // Handle new image uploads
    if (req.files && req.files.images) {
      for (const imageFile of req.files.images) {
        const uploadResult = await uploadToCloudinary.productImage(
          imageFile.path,
          updateData.name || existingProduct.name
        );
        newImages.push(uploadResult.secure_url);
      }
    }

    // Handle new spec sheet uploads
    if (req.files && req.files.specSheets) {
      for (const specFile of req.files.specSheets) {
        const uploadResult = await uploadToCloudinary.specSheet(
          specFile.path,
          updateData.name || existingProduct.name,
          specFile.originalname
        );
        newSpecSheets.push(uploadResult.secure_url);
      }
    }

    // Update product
    const updated = await Product.findByIdAndUpdate(
      productId,
      {
        ...updateData,
        images: newImages,
        specSheets: newSpecSheets
      },
      { new: true, runValidators: true }
    ).populate(['category', 'brand', 'tags']);

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE product image
export const deleteProductImage = async (req, res) => {
  try {
    const { productId, imageUrl } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Extract public_id from Cloudinary URL
    const publicId = imageUrl.split('/').pop().split('.')[0];
    
    // Delete from Cloudinary
    await deleteFromCloudinary(publicId);

    // Remove from product
    product.images = product.images.filter(img => img !== imageUrl);
    await product.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE spec sheet
export const deleteSpecSheet = async (req, res) => {
  try {
    const { productId, specSheetUrl } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Extract public_id from Cloudinary URL
    const publicId = specSheetUrl.split('/').pop().split('.')[0];
    
    // Delete from Cloudinary
    await deleteFromCloudinary(publicId, 'raw');

    // Remove from product
    product.specSheets = product.specSheets.filter(specUrl => specUrl !== specSheetUrl);
    await product.save();

    res.json({ message: 'Spec sheet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
