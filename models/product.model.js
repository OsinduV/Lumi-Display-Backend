import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  images: [String],
  category: String,
  brand: String,
  tags: [String],
  description: String,
  specificationFiles: [String],
   warranty: String,
});

const Product = mongoose.model('Product', productSchema);

export default Product;
