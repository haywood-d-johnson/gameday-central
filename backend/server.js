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

// CORS configuration
const corsOptions = {
    origin: [
        'https://gameday-central.vercel.app',
        'https://gameday-central-production.up.railway.app',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
};

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        message: "Too many requests from this IP, please try again later.",
    },
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(limiter);

// Routes
app.use("/api/games", gamesRoutes);
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
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
        });
    } catch (error) {
        console.error("Error initializing server:", error);
        process.exit(1);
    }
};

initializeServer();
