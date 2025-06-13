import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    forgotPassword,
    resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

// Register

router.get('/protected', authenticate, (req, res) => {
    res.json({ message: `Hello ${req.user.role}, you are authenticated.` });
});

router.get('/admin-only', authenticate, authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Welcome admin! You have access.' });
});


router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
        console.log({ token: token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
