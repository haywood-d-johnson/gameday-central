const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");

// Import routes
const gamesRoutes = require("../routes/games.routes");

/**
 * Express configuration
 */
const configureExpress = () => {
    const app = express();

    const alowedOrigins = [
        "http://localhost:3000",
        "https://gameday-central.vercel.app",
    ];

    // Security middleware
    app.use(helmet());

    // Enable CORS
    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin || alowedOrigins.includes(origin)) {
                    callback(null, origin);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            optionsSuccessStatus: 200,
        })
    );

    // Request parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Compression
    app.use(compression());

    // Logging
    if (process.env.NODE_ENV === "development") {
        app.use(morgan("dev"));
    } else {
        app.use(morgan("combined"));
    }

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 100, // 100 requests per minute
        message: {
            message: "Too many requests from this IP, please try again later.",
        },
    });
    app.use("/api/", limiter);

    // API Routes
    app.use("/api/games", gamesRoutes);

    // Serve static files in production
    if (process.env.NODE_ENV === "production") {
        app.use(express.static(path.join(__dirname, "../../frontend/build")));

        app.get("*", (req, res) => {
            res.sendFile(
                path.join(__dirname, "../../frontend/build/index.html")
            );
        });
    }

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
            message: "Something went wrong!",
            error:
                process.env.NODE_ENV === "development"
                    ? err.message
                    : undefined,
        });
    });

    return app;
};

module.exports = configureExpress;
