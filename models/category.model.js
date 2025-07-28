import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0, // 0 for parent categories, 1 for subcategories
    max: 1 // Only allow 2 levels (parent and child)
  }
}, {
  timestamps: true
});

// Pre-save middleware to validate hierarchy rules
categorySchema.pre('save', async function(next) {
  if (this.parent) {
    // Check if parent exists
    const parentCategory = await this.constructor.findById(this.parent);
    if (!parentCategory) {
      throw new Error('Parent category not found');
    }
    
    // Parent categories cannot have parents (only 2 levels allowed)
    if (parentCategory.parent) {
      throw new Error('Cannot create subcategory of a subcategory. Only 2 levels are allowed.');
    }
    
    // Set level to 1 for subcategories
    this.level = 1;
  } else {
    // Set level to 0 for parent categories
    this.level = 0;
  }
  
  next();
});

// Virtual for getting subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Ensure virtual fields are included in JSON output
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

export default mongoose.model('Category', categorySchema);