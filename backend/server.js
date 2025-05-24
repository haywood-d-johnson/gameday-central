require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const gamesRoutes = require("./routes/games.routes");
const gamesService = require("./services/games.service");
const cacheService = require("./services/cache.service");

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        message: "Too many requests from this IP, please try again later.",
    },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Routes
app.use("/api/games", gamesRoutes);

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
        });
    } catch (error) {
        console.error("Error initializing server:", error);
        process.exit(1);
    }
};

initializeServer();
