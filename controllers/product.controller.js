import Product from '../models/product.model.js';

// CREATE a new product
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET one product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('tags', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all products
export const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      tags,
      minPrice,
      maxPrice,
      specialOnly
    } = req.query;

    const query = {};

    // Text search
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { modelCode: new RegExp(search, 'i') }
      ];
    }

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Filter by Brand
    if (brand) {
      query.brand = brand;
    }

    // Filter by Tags (any tag match)
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Filter by Special Price
    if (specialOnly === 'true') {
      query.isSpecialPriceActive = true;
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('tags', 'name');

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// BULK CREATE products
export const bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required and must not be empty' });
    }

    const createdProducts = await Product.insertMany(products, { 
      ordered: false, // Continue processing even if some documents fail
      runValidators: true 
    });
    
    res.status(201).json({
      message: `Successfully created ${createdProducts.length} products`,
      products: createdProducts
    });
  } catch (error) {
    // Handle bulk write errors
    if (error.name === 'BulkWriteError') {
      const successCount = error.result.insertedCount;
      const failedCount = error.writeErrors.length;
      
      return res.status(207).json({
        message: `Bulk operation completed with some failures`,
        successCount,
        failedCount,
        insertedProducts: error.result.insertedIds,
        errors: error.writeErrors.map(err => ({
          index: err.index,
          error: err.errmsg
        }))
      });
    }
    
    res.status(400).json({ error: error.message });
  }
};

// BULK UPDATE products
export const bulkUpdateProducts = async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required and must not be empty' });
    }

    const bulkOps = updates.map(update => {
      if (!update.id) {
        throw new Error('Each update must include an id field');
      }
      
      const { id, ...updateData } = update;
      return {
        updateOne: {
          filter: { _id: id },
          update: { $set: updateData },
          upsert: false
        }
      };
    });

    const result = await Product.bulkWrite(bulkOps, { ordered: false });
    
    res.json({
      message: 'Bulk update completed',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      details: result
    });
  } catch (error) {
    if (error.name === 'BulkWriteError') {
      return res.status(207).json({
        message: 'Bulk update completed with some failures',
        matchedCount: error.result.matchedCount,
        modifiedCount: error.result.modifiedCount,
        errors: error.writeErrors.map(err => ({
          index: err.index,
          error: err.errmsg
        }))
      });
    }
    
    res.status(400).json({ error: error.message });
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


