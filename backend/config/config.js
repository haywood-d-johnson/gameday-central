require("dotenv").config();

const config = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 5000,
    frontend: {
        url: process.env.FRONTEND_URL || "http://localhost:3000",
    },
    cache: {
        ttl: process.env.CACHE_TTL || 3600, // 1 hour in seconds
        checkPeriod: process.env.CACHE_CHECK_PERIOD || 600, // 10 minutes in seconds
    },
    rateLimiting: {
        windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000, // 1 minute
        max: process.env.RATE_LIMIT_MAX || 100, // requests per window
    },
    api: {
        espn: {
            baseUrl:
                process.env.ESPN_API_BASE_URL ||
                "https://site.api.espn.com/apis/site/v2",
            endpoints: {
                scoreboard: "/sports/football/scoreboard",
            },
        },
    },
    logging: {
        format: process.env.NODE_ENV === "development" ? "dev" : "combined",
    },
};

module.exports = config;
