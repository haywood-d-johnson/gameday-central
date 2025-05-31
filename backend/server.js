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
    origin: process.env.NODE_ENV === 'production'
        ? ['https://gameday-central.vercel.app', 'https://gameday-central-production.up.railway.app']
        : ['http://localhost:3000'],
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
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
        origin: req.headers.origin,
        authorization: req.headers.authorization ? 'Present' : 'Not Present',
        timestamp: new Date().toISOString(),
        headers: req.headers,
        body: req.method === 'POST' ? req.body : undefined
    });
    next();
});

// Health check response function
const getHealthInfo = () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
    auth: process.env.JWT_SECRET ? 'configured' : 'not configured',
    memory: process.memoryUsage(),
    uptime: process.uptime()
});

// Health check handler
const handleHealthCheck = (req, res) => {
    console.log('Health check request received:', {
        path: req.path,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl
    });

    const healthInfo = getHealthInfo();
    console.log('Health Check Response:', healthInfo);
    res.json(healthInfo);
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoints - available at both /health and /api/health
app.get('/health', handleHealthCheck);
app.get('/api/health', handleHealthCheck);

// Rate limiting for API routes
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        message: "Too many requests from this IP, please try again later.",
    },
});

// Routes - mount all routes under /api with rate limiting
const apiRouter = express.Router();
apiRouter.use(limiter);  // Apply rate limiting to all API routes
apiRouter.use("/games", gamesRoutes);
apiRouter.use("/auth", authRoutes);

// Mount the API router
app.use("/api", apiRouter);

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

// Function to log registered routes
const logRoutes = () => {
    console.log('\nRegistered Routes:');
    const printRoutes = (stack, prefix = '') => {
        stack.forEach(mw => {
            if (mw.route) {
                const methods = Object.keys(mw.route.methods).join(', ').toUpperCase();
                console.log(`${methods} ${prefix}${mw.route.path}`);
            } else if (mw.name === 'router') {
                const newPrefix = prefix + (mw.regexp.toString().replace('/^\\', '').replace('\\/?(?=\\/|$)/i', ''));
                printRoutes(mw.handle.stack, newPrefix);
            }
        });
    };

    if (app._router && app._router.stack) {
        printRoutes(app._router.stack);
    }
};

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
            console.log('CORS configuration:', corsOptions);

            // Log routes after server has started
            logRoutes();
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
