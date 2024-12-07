const express = require('express');
const multer = require('multer');
const Image = require('../models/Image');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    limits: { fileSize: 300 * 1024 }, // 300KB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
});

// Route to handle image upload and enhancement
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Save the original image to the database
        const originalImage = new Image({
            filename: req.file.originalname,
            data: req.file.buffer,
            contentType: req.file.mimetype,
        });
        await originalImage.save();

        // Dynamically import Gradio client
        const { Client } = await import('@gradio/client');

        // Enhance the image using Gradio's API
        const client = await Client.connect("DakuSir/ESRGAN");
        const result = await client.predict("/predict", {
            image: req.file.buffer,
            size: "2x", // Specify resolution model
        });

        // Fetch the enhanced image (result.data contains the image URL)
        const enhancedImageResponse = await fetch(result.data);
        const enhancedImageBuffer = await enhancedImageResponse.buffer();

        // Save the enhanced image to the database
        const enhancedImage = new Image({
            filename: `enhanced-${req.file.originalname}`,
            data: enhancedImageBuffer,
            contentType: req.file.mimetype,
        });
        await enhancedImage.save();

        // Respond with IDs of original and enhanced images
        res.status(201).json({
            message: 'Image uploaded and enhanced successfully',
            originalImageId: originalImage._id,
            enhancedImageId: enhancedImage._id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Image enhancement failed', error: error.message });
    }
});

// Route to fetch an image by ID
router.get('/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Set the content type and send the image data
        res.set('Content-Type', image.contentType);
        res.send(image.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve image', error: error.message });
    }
});

module.exports = router;
