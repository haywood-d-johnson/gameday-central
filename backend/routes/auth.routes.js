const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { z } = require('zod');

// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
    password: z.string().min(8),
    firstName: z.string().optional(),
    lastName: z.string().optional()
});

const loginSchema = z.object({
    emailOrUsername: z.string(),
    password: z.string()
});

const preferencesSchema = z.object({
    favoriteTeams: z.array(z.string()).optional(),
    darkMode: z.boolean().optional(),
    notifications: z.boolean().optional()
});

// Middleware to validate JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const user = await authService.validateToken(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Register new user
router.post('/register', async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const result = await authService.register(validatedData);
        res.status(201).json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(400).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const result = await authService.login(validatedData.emailOrUsername, validatedData.password);
        res.json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(401).json({ message: error.message });
    }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    res.json(req.user);
});

// Update user preferences
router.patch('/preferences', authenticateToken, async (req, res) => {
    try {
        const validatedData = preferencesSchema.parse(req.body);
        const updatedPreferences = await authService.updatePreferences(req.user.id, validatedData);
        res.json(updatedPreferences);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
