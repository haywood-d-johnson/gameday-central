const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';
const SALT_ROUNDS = 10;

class AuthService {
    async register(userData) {
        const { email, password, firstName, lastName } = userData;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                preferences: {
                    create: {
                        favoriteTeams: [],
                        darkMode: false,
                        notifications: true
                    }
                }
            },
            include: {
                preferences: true
            }
        });

        // Generate JWT
        const token = this.generateToken(user);

        // Return user data (excluding password) and token
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token
        };
    }

    async login(email, password) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                preferences: true
            }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT
        const token = this.generateToken(user);

        // Return user data (excluding password) and token
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token
        };
    }

    async updatePreferences(userId, preferences) {
        return prisma.userPreferences.update({
            where: { userId },
            data: preferences
        });
    }

    generateToken(user) {
        return jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
    }

    async validateToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: { preferences: true }
            });

            if (!user) {
                throw new Error('User not found');
            }

            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

module.exports = new AuthService();
