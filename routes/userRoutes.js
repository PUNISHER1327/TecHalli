const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Register a user
router.post('/register', async (req, res) => {
    const { name, email, password, location } = req.body;
    try {
        const newUser = new User({ name, email, password, location });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (!user) return res.status(404).json({ message: 'Invalid credentials' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
