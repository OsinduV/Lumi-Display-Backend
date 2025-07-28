import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  image: { type: String, trim: true } // URL or path to brand logo/image
}, { timestamps: true });

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
