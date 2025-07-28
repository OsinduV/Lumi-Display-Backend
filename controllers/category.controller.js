import Category from '../models/category.model.js';

// CREATE a new category
export const createCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;
    
    // If parent is provided, validate it
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ error: 'Parent category not found' });
      }
      
      // Check if parent already has a parent (only 2 levels allowed)
      if (parentCategory.parent) {
        return res.status(400).json({ 
          error: 'Cannot create subcategory of a subcategory. Only 2 levels are allowed.' 
        });
      }
    }
    
    const category = new Category({ name, parent });
    const saved = await category.save();
    
    // Populate parent information in response
    await saved.populate('parent', 'name');
    
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// GET one category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name')
      .populate('subcategories', 'name');
    
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all categories with hierarchy
export const getAllCategories = async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc', includeHierarchy = 'false' } = req.query;
    
    const query = {};
    
    // Text search
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let categories;
    
    if (includeHierarchy === 'true') {
      // Return hierarchical structure
      categories = await Category.find(query)
        .populate('parent', 'name')
        .populate('subcategories', 'name')
        .sort(sortConfig);
    } else {
      // Return flat list
      categories = await Category.find(query)
        .populate('parent', 'name')
        .sort(sortConfig);
    }
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET only parent categories (no subcategories)
export const getParentCategories = async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    const query = { parent: null }; // Only parent categories
    
    // Text search
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const categories = await Category.find(query)
      .populate('subcategories', 'name')
      .sort(sortConfig);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET subcategories of a specific parent
export const getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    const query = { parent: parentId };
    
    // Text search
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const subcategories = await Category.find(query)
      .populate('parent', 'name')
      .sort(sortConfig);
    
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET category tree structure
export const getCategoryTree = async (req, res) => {
  try {
    const parentCategories = await Category.find({ parent: null })
      .populate({
        path: 'subcategories',
        select: 'name'
      })
      .sort({ name: 1 });
    
    res.json(parentCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE category
export const updateCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const categoryId = req.params.id;
    
    // Get current category
    const currentCategory = await Category.findById(categoryId);
    if (!currentCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // If updating parent, validate the new parent
    if (parent !== undefined) {
      if (parent) {
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          return res.status(400).json({ error: 'Parent category not found' });
        }
        
        // Check if parent already has a parent (only 2 levels allowed)
        if (parentCategory.parent) {
          return res.status(400).json({ 
            error: 'Cannot set parent to a subcategory. Only 2 levels are allowed.' 
          });
        }
        
        // Prevent setting self as parent
        if (parent === categoryId) {
          return res.status(400).json({ error: 'Category cannot be its own parent' });
        }
        
        // If current category has subcategories, it cannot become a subcategory
        const hasSubcategories = await Category.exists({ parent: categoryId });
        if (hasSubcategories) {
          return res.status(400).json({ 
            error: 'Category with subcategories cannot become a subcategory itself' 
          });
        }
      }
    }
    
    const updated = await Category.findByIdAndUpdate(
      categoryId, 
      { name, parent }, 
      {
        new: true,
        runValidators: true
      }
    ).populate('parent', 'name');
    
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// DELETE category
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category has subcategories
    const hasSubcategories = await Category.exists({ parent: categoryId });
    if (hasSubcategories) {
      return res.status(400).json({ 
        error: 'Cannot delete category that has subcategories. Delete subcategories first.' 
      });
    }
    
    const deleted = await Category.findByIdAndDelete(categoryId);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};