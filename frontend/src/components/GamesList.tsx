import React from 'react';
import { useGames } from '../hooks/useGames';

export const GamesList: React.FC = () => {
    const { games, loading, error } = useGames();

    if (loading) {
        return <div>Loading games...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!games || games.length === 0) {
        return <div>No games available</div>;
    }

    return (
        <div className="games-list">
            <h2>NFL Games</h2>
            {games.map(game => (
                <div key={game.gameId} className="game-card">
                    <h3>{game.matchup}</h3>
                    <div className="game-details">
                        <p className="start-time">{game.startTime}</p>
                        <p className="status">{game.status}</p>
                        <p className="venue">{game.venue}</p>
                    </div>
                    <div className="broadcast-info">
                        <p><strong>TV:</strong> {game.watchOn.tv}</p>
                        <p><strong>Streaming:</strong> {game.watchOn.streaming}</p>
                        <p><strong>Radio:</strong> {game.watchOn.radio}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
