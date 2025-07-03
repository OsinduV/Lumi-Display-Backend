import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: String,
  price: String,
  description: String,
  imageUrl: String,
  category: String,
  brand: String,
  tags: [String],
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

export default Product;
