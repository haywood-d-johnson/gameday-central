require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const gamesRoutes = require("./routes/games.routes");
const authRoutes = require("./routes/auth.routes");
const gamesService = require("./services/games.service");
const cacheService = require("./services/cache.service");

const app = express();
const PORT = process.env.PORT || 5000;

// Log startup configuration
console.log('Server Configuration:', {
    nodeEnv: process.env.NODE_ENV,
    port: PORT,
    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not Set',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not Set'
});

// CORS configuration
const corsOptions = {
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400
};

// Enhanced request logging
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        path: req.path,
        origin: req.headers.origin,
        authorization: req.headers.authorization ? 'Present' : 'Not Present',
        timestamp: new Date().toISOString(),
        body: req.method === 'POST' ? req.body : undefined
    });
    next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        message: "Too many requests from this IP, please try again later.",
    },
});

app.use(limiter);

// Health check endpoint with detailed information
app.get('/api/health', (req, res) => {
    const healthInfo = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: process.env.DATABASE_URL ? 'configured' : 'not configured',
        auth: process.env.JWT_SECRET ? 'configured' : 'not configured',
        memory: process.memoryUsage(),
        uptime: process.uptime()
    };

    console.log('Health Check:', healthInfo);
    res.json(healthInfo);
});

// Routes
app.use("/api/games", gamesRoutes);
app.use("/api/auth", authRoutes);

// Error handling middleware with better logging
app.use((err, req, res, next) => {
    const errorDetails = {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        body: req.method === 'POST' ? req.body : undefined,
        timestamp: new Date().toISOString()
    };

    console.error('Error occurred:', errorDetails);

    // Send appropriate error response
    if (err.name === 'ZodError') {
        return res.status(400).json({
            message: 'Validation error',
            errors: err.errors
        });
    }

    if (err.name === 'PrismaClientKnownRequestError') {
        return res.status(400).json({
            message: 'Database error',
            code: err.code,
            detail: err.message
        });
    }

    res.status(err.status || 500).json({
        message: err.message || "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? errorDetails : undefined,
    });
});

// Initialize cache and start cron jobs
const initializeServer = async () => {
    try {
        // Initialize cache with initial data
        await cacheService.initializeCache(gamesService);
        console.log("Cache initialized successfully");

        // Start cache refresh schedule
        cacheService.scheduleCacheRefresh(gamesService);
        console.log("Cache refresh schedule started");

        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('CORS configuration:', {
                mode: 'permissive',
                origins: 'all'
            });
        });
    } catch (error) {
        console.error("Error initializing server:", {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        process.exit(1);
    }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', {
        reason,
        promise,
        timestamp: new Date().toISOString()
    });
});

initializeServer();
