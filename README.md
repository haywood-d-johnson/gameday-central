# Game Day Central 🏈

A real-time application to find where to watch football games across different platforms - TV networks, streaming services, and radio broadcasts.

## Features 🌟

-   Real-time game information from ESPN's API
-   Broadcast information for all football games
-   Automatic mapping of streaming services based on TV networks
-   Multiple ways to find games:
    -   By team
    -   By date
    -   By venue
-   Smart caching system with automatic updates
-   Rate limiting to prevent abuse

## Tech Stack 💻

### Backend

-   Node.js
-   Express
-   node-cache (for caching)
-   node-cron (for scheduled updates)
-   axios (for API requests)

### Frontend (Coming Soon)

-   React
-   Material-UI
-   React Router
-   Redux

## Getting Started 🚀

### Prerequisites

-   Node.js (v14 or higher)
-   npm (v6 or higher)

### Installation

1. Clone the repository

```bash
git clone https://github.com/haywood-d-johnson/gameday-central.git
cd gameday-central
```

2. Install dependencies

```bash
npm install
```

3. Create environment file

```bash
cp backend/.env.example backend/.env
```

4. Start the development server

```bash
# Start backend only
npm run dev

# Start both backend and frontend (when available)
npm run dev:all
```

## API Endpoints 🛣️

### Games

-   `GET /api/games` - Get all games with broadcast information
-   `GET /api/games/team/:teamId` - Get games by team
-   `GET /api/games/date/:date` - Get games by date
-   `GET /api/games/venue/:venueId` - Get games by venue

For detailed API documentation, see [backend/API.md](backend/API.md)

## Caching System ⚡

The application implements a smart caching system to ensure fast responses and minimize API calls:

-   Full data refresh every morning at 6:00 AM
-   Hourly updates during game days (Sunday, Monday, Thursday)
-   Automatic cache invalidation when game status changes
-   Manual cache refresh available through admin endpoint

## Rate Limiting 🚦

To prevent abuse, the API implements rate limiting:

-   100 requests per minute per IP address
-   Cached results don't count towards the limit

## Project Structure 📁

```
gameday-central/
├── backend/
│   ├── controllers/     # Request handlers
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── server.js       # Express server
│   └── API.md          # API documentation
├── frontend/           # React frontend (coming soon)
├── package.json        # Project dependencies
└── README.md          # This file
```

## Environment Variables 🔑

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## Future Enhancements 🔮

-   [ ] Frontend implementation
-   [ ] User accounts and preferences
-   [ ] Push notifications for game start times
-   [ ] Regional blackout information
-   [ ] TV channel numbers for major providers
-   [ ] Integration with streaming service deep links

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 👏

-   ESPN API for game data
-   Football for broadcast information
-   All contributors and users of the application

## 🌟 Author

**Haywood D. Johnson**

[GitHub](https://github.com/haywood-d-johnson) | [LinkedIn](https://www.linkedin.com/in/haywood-d-johnson/) | [Portfolio](https://www.hdjohnson-dev.online/)
