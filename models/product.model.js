import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  modelCode:    { type: String, unique: true, trim: true },
  description:  { type: String },
  features:     [{ type: String }],

  images:       [{ type: String }],
  specSheets:   [{ type: String }],

  category:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand:        { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  tags:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],

  sizes:        [{ type: String }],
  colors:       [{ type: String }],
  shapes:       [{ type: String }],

  price:               { type: Number },
  mrp:                 { type: Number },
  redistributionPrice: { type: Number },
  specialPrice:        { type: Number },
  isSpecialPriceActive:{ type: Boolean, default: false }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
