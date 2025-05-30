const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';
const SALT_ROUNDS = 10;

class AuthService {
    async register(userData) {
        const { email, username, password, firstName, lastName } = userData;

        try {
            // Check if user already exists
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email },
                        { username }
                    ]
                }
            });

            if (existingUser) {
                if (existingUser.email === email) {
                    throw new Error('Email already in use');
                }
                if (existingUser.username === username) {
                    throw new Error('Username already taken');
                }
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            // Create user
            const user = await prisma.user.create({
                data: {
                    email,
                    username,
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
        } catch (error) {
            console.error('Registration error:', {
                message: error.message,
                email,
                username
            });
            throw error;
        }
    }

    async login(emailOrUsername, password) {
        try {
            // Find user by email or username
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: emailOrUsername },
                        { username: emailOrUsername }
                    ]
                },
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
        } catch (error) {
            console.error('Login error:', {
                message: error.message,
                emailOrUsername
            });
            throw error;
        }
    }

    async updatePreferences(userId, preferences) {
        try {
            return await prisma.userPreferences.update({
                where: { userId },
                data: preferences
            });
        } catch (error) {
            console.error('Update preferences error:', {
                message: error.message,
                userId,
                preferences
            });
            throw error;
        }
    }

    generateToken(user) {
        try {
            return jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
        } catch (error) {
            console.error('Token generation error:', {
                message: error.message,
                userId: user.id
            });
            throw error;
        }
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
            console.error('Token validation error:', {
                message: error.message,
                token: token ? 'Present' : 'Not Present'
            });
            throw error;
        }
    }
}

module.exports = new AuthService();
