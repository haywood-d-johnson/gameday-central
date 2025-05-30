const express = require("express");
const router = express.Router();
const gamesController = require("../controllers/games.controller");

// Healthcheck endpoint
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "games-api"
    });
});

// Get all games with broadcast info
router.get("/", gamesController.getAllGames);

// Get games by team
router.get("/team/:teamId", gamesController.getGamesByTeam);

// Get games by date
router.get("/date/:date", gamesController.getGamesByDate);

// Get games by location/venue
router.get("/venue/:venueId", gamesController.getGamesByVenue);

module.exports = router;
