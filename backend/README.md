# NFL Game Day Central API Documentation

## API Endpoints

### 1. Get All Games

```http
GET /api/games
```

Returns all NFL games with their broadcast information.

#### Response

```json
{
    "message": "Found 16 games",
    "games": [
        {
            "gameId": "401772510",
            "matchup": "Dallas Cowboys @ Philadelphia Eagles",
            "startTime": "Thursday, September 4, 2025, 7:20 PM CDT",
            "status": "Scheduled",
            "venue": "Lincoln Financial Field",
            "watchOn": {
                "tv": "NBC, Peacock",
                "streaming": "Peacock, NFL+",
                "radio": "No radio broadcast information available"
            }
        }
    ]
}
```

### 2. Get Games by Team

```http
GET /api/games/team/:teamId
```

Returns games for a specific team. The teamId should be lowercase with hyphens (e.g., "dallas-cowboys").

#### Parameters

-   `teamId` (string): Team identifier in lowercase with hyphens

#### Response

```json
{
  "message": "Found 2 games for dallas-cowboys",
  "games": [...]
}
```

### 3. Get Games by Date

```http
GET /api/games/date/:date
```

Returns games for a specific date. Date format should be YYYY-MM-DD.

#### Parameters

-   `date` (string): Date in YYYY-MM-DD format

#### Response

```json
{
  "message": "Found 12 games for 2025-09-07",
  "games": [...]
}
```

### 4. Get Games by Venue

```http
GET /api/games/venue/:venueId
```

Returns games at a specific venue. The venueId should be lowercase with hyphens.

#### Parameters

-   `venueId` (string): Venue identifier in lowercase with hyphens

#### Response

```json
{
  "message": "Found 1 games at lincoln-financial-field",
  "games": [...]
}
```

## Data Refresh Schedule

The API implements caching with the following refresh schedule:

-   Full data refresh every morning at 6:00 AM local time
-   Cache invalidation when game status changes
-   Manual cache refresh available through admin endpoint

## Error Responses

### 404 Not Found

```json
{
    "message": "No games found for the specified criteria"
}
```

### 500 Server Error

```json
{
    "message": "Something went wrong!",
    "error": "Detailed error message (only in development mode)"
}
```

## Rate Limiting

-   100 requests per minute per IP address
-   Cache results are served without counting towards rate limit

## Available Endpoints

### Get Raw NFL Game Data

```javascript
const response = await fetchNFLGames();
```

This endpoint returns the raw game data from ESPN's API, including detailed information about teams, venues, and broadcast details.

## Testing Commands

To test these endpoints in Node.js:

1. Get all games with broadcast information:

```bash
node -e "require('./routes.js').getGameBroadcastInfo().then(console.log).catch(console.error)"
```

2. Get detailed information for a single game:

```bash
node -e "require('./routes.js').getGameBroadcastInfo().then(games => console.log(JSON.stringify(games.games[0], null, 2))).catch(console.error)"
```

## Broadcast Information

The API automatically provides information about where to watch games across different platforms:

### TV Networks

-   NBC
-   CBS
-   FOX
-   ESPN
-   ABC
-   NFL Network

### Streaming Services

The API automatically suggests streaming services based on the TV network:

-   Peacock (NBC games)
-   Paramount+ (CBS games)
-   ESPN+ (ESPN/ABC games)
-   Fox Sports App (FOX games)
-   NFL+ (all games)

### Radio

Radio broadcast information is included when available from the source data.

## Data Structure

### Game Object

```typescript
interface Game {
    gameId: string;
    matchup: string; // e.g., "Dallas Cowboys @ Philadelphia Eagles"
    startTime: string; // Formatted date and time
    status: string; // e.g., "Scheduled", "In Progress", "Final"
    venue: string; // Stadium name
    watchOn: {
        tv: string; // Comma-separated list of TV networks
        streaming: string; // Comma-separated list of streaming services
        radio: string; // Radio broadcast information
    };
}
```

## Error Handling

The API includes proper error handling and will return appropriate error messages if:

-   The ESPN API is unavailable
-   No games are found
-   Invalid parameters are provided
-   Any other errors occur during data fetching or processing
