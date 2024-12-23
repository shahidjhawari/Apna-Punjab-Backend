const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require('../models/Product');
const Category = require('../models/Category');

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'apna-punjab',
    allowed_formats: ['jpg', 'jpeg', 'png'], // Added 'jpeg' for compatibility
    use_filename: true,
    unique_filename: true,
  },
});

const upload = multer({ storage });

// Get products by category
router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    if (!category) {
      console.log('Category is missing');
      return res.status(400).json({ message: 'Category is required' });
    }

    const categoryObj = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
    if (!categoryObj) {
      console.log('Category not found');
      return res.status(404).json({ message: 'Category not found' });
    }

    const products = await Product.find({ category: categoryObj._id }).populate('category');
    console.log('Products found:', products);
    res.status(200).json(products);
  } catch (error) {
    console.error('Internal server error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Add a new product
router.post('/', upload.single('image'), async (req, res) => {
  const { name, category } = req.body;

  try {
    if (!name || !category || !req.file) {
      return res.status(400).json({ message: 'Name, category, and image are required' });
    }

    // Case-insensitive search for the category
    const categoryObj = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
    if (!categoryObj) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Save the product
    const newProduct = new Product({
      name,
      category: categoryObj._id,
      image: req.file.path,
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error(error.message); // Log the error for debugging
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
