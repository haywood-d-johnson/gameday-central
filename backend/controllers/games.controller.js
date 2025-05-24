const gamesService = require("../services/games.service");
const cacheService = require("../services/cache.service");

const getAllGames = async (req, res, next) => {
    try {
        const games = await cacheService.getGames(gamesService);
        res.json(games);
    } catch (error) {
        next(error);
    }
};

const getGamesByTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const games = await cacheService.getTeamGames(teamId, gamesService);
        res.json(games);
    } catch (error) {
        next(error);
    }
};

const getGamesByDate = async (req, res, next) => {
    try {
        const { date } = req.params;
        const games = await cacheService.getDateGames(date, gamesService);
        res.json(games);
    } catch (error) {
        next(error);
    }
};

const getGamesByVenue = async (req, res, next) => {
    try {
        const { venueId } = req.params;
        const games = await cacheService.getVenueGames(venueId, gamesService);
        res.json(games);
    } catch (error) {
        next(error);
    }
};

// Admin endpoint to manually refresh cache
const refreshCache = async (req, res, next) => {
    try {
        cacheService.clearCache();
        const games = await cacheService.initializeCache(gamesService);
        res.json({
            message: "Cache refreshed successfully",
            games,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllGames,
    getGamesByTeam,
    getGamesByDate,
    getGamesByVenue,
    refreshCache,
};
