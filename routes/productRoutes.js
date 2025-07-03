import express from 'express';
const router = express.Router();

import Product from '../models/product.js';
import multer from 'multer';

import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});

router.post('/', upload.single('image'), async (req, res) => {
  let imageUrl = '';
  if (req.file) {
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
    const result = await streamUpload(req);
    imageUrl = result.secure_url;
  }

  const newProduct = new Product({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    imageUrl,
    category: req.body.category,
    brand: req.body.brand,
    tags: req.body.tags ? req.body.tags.split(',') : [],
  });

  await newProduct.save();
  res.json(newProduct);
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send('Product not found');

  if (req.file) {
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
    const result = await streamUpload(req);
    product.imageUrl = result.secure_url;
  }

  product.name = req.body.name || product.name;
  product.price = req.body.price || product.price;
  product.description = req.body.description || product.description;
  product.category = req.body.category || product.category;
  product.brand = req.body.brand || product.brand;
  product.tags = req.body.tags ? req.body.tags.split(',') : product.tags;

  await product.save();
  res.json(product);
});

router.delete('/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

export default router;
