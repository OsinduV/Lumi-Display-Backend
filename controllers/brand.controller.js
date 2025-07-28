import Brand from '../models/brand.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// CREATE a new brand with image upload
export const createBrandWithImage = async (req, res) => {
  try {
    const { name } = req.body;
    let imageUrl = null;

    // Handle image upload if file is provided
    if (req.file) {
      const uploadResult = await uploadToCloudinary.brandImage(req.file.path, name);
      imageUrl = uploadResult.secure_url;
    }

    const brand = new Brand({
      name,
      image: imageUrl
    });

    const saved = await brand.save();
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Brand name already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// CREATE a new brand
export const createBrand = async (req, res) => {
  try {
    const brand = new Brand(req.body);
    const saved = await brand.save();
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Brand name already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// GET one brand by ID
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all brands
export const getAllBrands = async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    const query = {};
    
    // Text search
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const brands = await Brand.find(query).sort(sortConfig);
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE brand with image upload
export const updateBrandWithImage = async (req, res) => {
  try {
    const { name } = req.body;
    const brandId = req.params.id;
    
    // Get existing brand
    const existingBrand = await Brand.findById(brandId);
    if (!existingBrand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    let updateData = { name };

    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      if (existingBrand.image) {
        const oldPublicId = existingBrand.image.split('/').pop().split('.')[0];
        await deleteFromCloudinary(oldPublicId);
      }

      // Upload new image
      const uploadResult = await uploadToCloudinary.brandImage(req.file.path, name);
      updateData.image = uploadResult.secure_url;
    }

    const updated = await Brand.findByIdAndUpdate(brandId, updateData, {
      new: true,
      runValidators: true
    });

    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Brand name already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// UPDATE brand
export const updateBrand = async (req, res) => {
  try {
    const updated = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: 'Brand not found' });
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Brand name already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// DELETE brand
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    // Delete image from Cloudinary if exists
    if (brand.image) {
      const publicId = brand.image.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId);
    }

    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
