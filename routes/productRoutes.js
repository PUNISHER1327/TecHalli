const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('createdBy', 'name email');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a product
router.post('/', async (req, res) => {
    const { name, description, price, category, imageUrl, createdBy } = req.body;
    try {
        const newProduct = new Product({ name, description, price, category, imageUrl, createdBy });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;