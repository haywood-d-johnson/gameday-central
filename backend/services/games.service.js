const axios = require("axios");

// ESPN API endpoints
const ESPN_BASE_URL = "https://site.api.espn.com/apis/site/v2";
const ESPN_NFL_SCOREBOARD = `${ESPN_BASE_URL}/sports/football/nfl/scoreboard`;

// Fallback data for when ESPN API is unavailable
const FALLBACK_RESPONSE = {
    message: "ESPN API temporarily unavailable. Using cached data.",
    games: []
};

// Add timeout to axios requests
const axiosInstance = axios.create({
    timeout: 5000, // 5 seconds timeout
});

const formatBroadcastInfo = (broadcasts, geoBroadcasts) => {
    const broadcastInfo = {
        tv: [],
        streaming: [],
        radio: [],
    };

    // Process main broadcasts
    if (broadcasts && broadcasts.length > 0) {
        broadcasts.forEach(broadcast => {
            if (broadcast.names) {
                broadcastInfo.tv.push(...broadcast.names);
            }
        });
    }

    // Process geoBroadcasts for more detailed information
    if (geoBroadcasts && geoBroadcasts.length > 0) {
        geoBroadcasts.forEach(broadcast => {
            const type = broadcast.type?.shortName?.toLowerCase();
            const media = broadcast.media?.shortName;

            if (type === "tv" && media) {
                if (!broadcastInfo.tv.includes(media)) {
                    broadcastInfo.tv.push(media);
                }
            } else if (type === "radio" && media) {
                broadcastInfo.radio.push(media);
            }
        });
    }

    // Add common streaming services based on TV networks
    if (broadcastInfo.tv.includes("NBC")) {
        broadcastInfo.streaming.push("Peacock");
    }
    if (broadcastInfo.tv.includes("CBS")) {
        broadcastInfo.streaming.push("Paramount+");
    }
    if (broadcastInfo.tv.includes("ESPN") || broadcastInfo.tv.includes("ABC")) {
        broadcastInfo.streaming.push("ESPN+");
    }
    if (broadcastInfo.tv.includes("FOX")) {
        broadcastInfo.streaming.push("Fox Sports App");
    }

    // Add NFL-specific streaming
    broadcastInfo.streaming.push("NFL+");

    return {
        tv:
            broadcastInfo.tv.join(", ") ||
            "No TV broadcast information available",
        streaming:
            broadcastInfo.streaming.join(", ") ||
            "No streaming information available",
        radio:
            broadcastInfo.radio.join(", ") ||
            "No radio broadcast information available",
    };
};

const fetchNFLGames = async () => {
    try {
        const response = await axiosInstance.get(ESPN_NFL_SCOREBOARD);
        return response.data.events
            .map(event => {
                const competition = event.competitions && event.competitions[0];
                if (!competition) {
                    console.log(`No competition data for event ${event.id}`);
                    return null;
                }

                const competitors = competition.competitors || [];
                const homeTeam = competitors.find(
                    team => team.homeAway === "home"
                );
                const awayTeam = competitors.find(
                    team => team.homeAway === "away"
                );

                // Get broadcast information
                const broadcastInfo = formatBroadcastInfo(
                    competition.broadcasts,
                    competition.geoBroadcasts
                );

                return {
                    id: event.id,
                    name: event.name,
                    shortName: event.shortName,
                    date: event.date,
                    competition: competition,
                    venue: competition.venue,
                    status: event.status,
                    teams: {
                        home: homeTeam,
                        away: awayTeam,
                    },
                    broadcasts: broadcastInfo,
                };
            })
            .filter(game => game !== null);
    } catch (error) {
        console.error("Error fetching NFL games from ESPN:", error.message);
        // Return empty array instead of throwing
        return [];
    }
};

const getGameBroadcastInfo = async () => {
    try {
        // Fetch today's NFL games
        const games = await fetchNFLGames();

        if (!games || games.length === 0) {
            return {
                ...FALLBACK_RESPONSE,
                timestamp: new Date().toISOString()
            };
        }

        // Process each game to include broadcast information
        const gamesWithBroadcastInfo = games.map(game => {
            const dateObj = new Date(game.date);
            const formattedDate = dateObj.toLocaleString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZoneName: "short",
            });

            return {
                gameId: game.id,
                matchup: `${game.teams.away.team.displayName} @ ${game.teams.home.team.displayName}`,
                startTime: formattedDate,
                status: game.status?.type?.description || "Status unknown",
                venue: game.venue?.fullName || "Venue TBD",
                watchOn: {
                    tv: game.broadcasts.tv,
                    streaming: game.broadcasts.streaming,
                    radio: game.broadcasts.radio,
                },
            };
        });

        return {
            message: `Found ${gamesWithBroadcastInfo.length} games`,
            games: gamesWithBroadcastInfo,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Error getting game broadcast information:", error.message);
        return {
            ...FALLBACK_RESPONSE,
            timestamp: new Date().toISOString(),
            error: error.message
        };
    }
};

module.exports = {
    fetchNFLGames,
    getGameBroadcastInfo,
};
