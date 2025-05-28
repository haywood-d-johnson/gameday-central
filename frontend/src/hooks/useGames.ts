import { useState, useEffect } from 'react';
import { ENDPOINTS } from '../api/config';

// Update the interface to match the actual API response
interface Game {
    gameId: string;
    matchup: string;
    startTime: string;
    status: string;
    venue: string;
    watchOn: {
        tv: string;
        streaming: string;
        radio: string;
    };
}

interface APIResponse {
    message: string;
    games: Game[];
}

interface UseGamesReturn {
    games: Game[];
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export const useGames = (): UseGamesReturn => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchGames = async () => {
        try {
            setLoading(true);
            const response = await fetch(ENDPOINTS.GAMES.ALL);
            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }
            const data: APIResponse = await response.json();
            console.log('Raw API Response:', data);

            if (data && data.games && Array.isArray(data.games)) {
                console.log('Found games array:', data.games);
                setGames(data.games);
            } else {
                console.error('Unexpected data format:', data);
                setGames([]);
            }
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err : new Error('An error occurred'));
            setGames([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    return {
        games,
        loading,
        error,
        refetch: fetchGames
    };
};
