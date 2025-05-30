const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { z } = require('zod');
const prisma = require('../lib/prisma');

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

// Debug endpoints - only available in development
if (process.env.NODE_ENV === 'development') {
    // Get user by email
    router.get('/debug/user/:email', async (req, res) => {
        try {
            const user = await prisma.user.findUnique({
                where: { email: req.params.email },
                include: { preferences: true }
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({
                message: 'Error checking user status',
                error: error.message
            });
        }
    });

    // Get user by username
    router.get('/debug/username/:username', async (req, res) => {
        try {
            const user = await prisma.user.findUnique({
                where: { username: req.params.username },
                include: { preferences: true }
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({
                message: 'Error checking user status',
                error: error.message
            });
        }
    });

    // List all users (paginated)
    router.get('/debug/users', async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const users = await prisma.user.findMany({
                skip,
                take: limit,
                include: { preferences: true },
                orderBy: { createdAt: 'desc' }
            });

            const total = await prisma.user.count();

            res.json({
                users: users.map(user => {
                    const { password, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                }),
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: page,
                    perPage: limit
                }
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error listing users',
                error: error.message
            });
        }
    });

    // Check token validity
    router.get('/debug/token/:token', async (req, res) => {
        try {
            const user = await authService.validateToken(req.params.token);
            res.json(user);
        } catch (error) {
            res.status(401).json({
                message: 'Invalid token',
                error: error.message
            });
        }
    });

    // Database health check
    router.get('/debug/db/health', async (req, res) => {
        try {
            // Try a simple query to check database connection
            await prisma.$queryRaw`SELECT 1`;

            // Get some basic stats
            const stats = {
                users: await prisma.user.count(),
                preferences: await prisma.userPreferences.count(),
                lastUser: await prisma.user.findFirst({
                    orderBy: { createdAt: 'desc' },
                    select: {
                        email: true,
                        username: true,
                        createdAt: true
                    }
                })
            };

            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                stats
            });
        } catch (error) {
            res.status(500).json({
                status: 'unhealthy',
                error: error.message
            });
        }
    });
}

module.exports = router;
