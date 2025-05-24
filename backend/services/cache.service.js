const NodeCache = require("node-cache");
const cron = require("node-cron");

// Cache will expire after 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

// Cache keys
const CACHE_KEYS = {
    ALL_GAMES: "all_games",
    TEAMS: {}, // Will store team-specific games
    DATES: {}, // Will store date-specific games
    VENUES: {}, // Will store venue-specific games
};

// Initialize cache
const initializeCache = async gamesService => {
    try {
        const games = await gamesService.getGameBroadcastInfo();
        cache.set(CACHE_KEYS.ALL_GAMES, games);
        return games;
    } catch (error) {
        console.error("Error initializing cache:", error);
        throw error;
    }
};

// Get games from cache or fetch fresh data
const getGames = async gamesService => {
    try {
        let games = cache.get(CACHE_KEYS.ALL_GAMES);
        if (!games) {
            games = await initializeCache(gamesService);
        }
        return games;
    } catch (error) {
        console.error("Error getting games from cache:", error);
        throw error;
    }
};

// Get team games from cache or compute and cache them
const getTeamGames = async (teamId, gamesService) => {
    try {
        const cacheKey = `team_${teamId}`;
        let teamGames = cache.get(cacheKey);

        if (!teamGames) {
            const allGames = await getGames(gamesService);
            teamGames = {
                message: `Found games for ${teamId}`,
                games: allGames.games.filter(game => {
                    const homeTeamId = game.homeTeam
                        ?.split(" ")
                        .join("-")
                        .toLowerCase();
                    const awayTeamId = game.awayTeam
                        ?.split(" ")
                        .join("-")
                        .toLowerCase();
                    const searchTeamId = teamId.toLowerCase();
                    return (
                        homeTeamId === searchTeamId ||
                        awayTeamId === searchTeamId
                    );
                }),
            };
            cache.set(cacheKey, teamGames);
        }

        return teamGames;
    } catch (error) {
        console.error("Error getting team games from cache:", error);
        throw error;
    }
};

// Get date games from cache or compute and cache them
const getDateGames = async (date, gamesService) => {
    try {
        const cacheKey = `date_${date}`;
        let dateGames = cache.get(cacheKey);

        if (!dateGames) {
            const allGames = await getGames(gamesService);
            dateGames = {
                message: `Found games for ${date}`,
                games: allGames.games.filter(game => {
                    const gameDate = new Date(game.startTime);
                    const searchDate = new Date(date);
                    return (
                        gameDate.toDateString() === searchDate.toDateString()
                    );
                }),
            };
            cache.set(cacheKey, dateGames);
        }

        return dateGames;
    } catch (error) {
        console.error("Error getting date games from cache:", error);
        throw error;
    }
};

// Get venue games from cache or compute and cache them
const getVenueGames = async (venueId, gamesService) => {
    try {
        const cacheKey = `venue_${venueId}`;
        let venueGames = cache.get(cacheKey);

        if (!venueGames) {
            const allGames = await getGames(gamesService);
            venueGames = {
                message: `Found games at ${venueId}`,
                games: allGames.games.filter(game => {
                    const gameVenue = game.venue
                        ?.split(" ")
                        .join("-")
                        .toLowerCase();
                    const searchVenue = venueId.toLowerCase();
                    return gameVenue === searchVenue;
                }),
            };
            cache.set(cacheKey, venueGames);
        }

        return venueGames;
    } catch (error) {
        console.error("Error getting venue games from cache:", error);
        throw error;
    }
};

// Clear all caches
const clearCache = () => {
    cache.flushAll();
    console.log("Cache cleared successfully");
};

// Schedule cache refresh
const scheduleCacheRefresh = gamesService => {
    // Refresh cache every morning at 6 AM
    cron.schedule("0 6 * * *", async () => {
        console.log("Running scheduled cache refresh...");
        try {
            await initializeCache(gamesService);
            console.log("Cache refresh completed successfully");
        } catch (error) {
            console.error("Error during scheduled cache refresh:", error);
        }
    });

    // Refresh cache every hour during game days (Sunday, Monday, Thursday)
    cron.schedule("0 * * * *", async () => {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 1 = Monday, 4 = Thursday

        if (day === 0 || day === 1 || day === 4) {
            console.log("Running game day cache refresh...");
            try {
                await initializeCache(gamesService);
                console.log("Game day cache refresh completed successfully");
            } catch (error) {
                console.error("Error during game day cache refresh:", error);
            }
        }
    });
};

module.exports = {
    initializeCache,
    getGames,
    getTeamGames,
    getDateGames,
    getVenueGames,
    clearCache,
    scheduleCacheRefresh,
};
