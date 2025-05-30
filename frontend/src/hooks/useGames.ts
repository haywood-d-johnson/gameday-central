import { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';
import { useAuth } from '../contexts/AuthContext';

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
    const { token } = useAuth();

    const fetchGames = async () => {
        try {
            setLoading(true);
            const response = await axios.get<APIResponse>(ENDPOINTS.GAMES.ALL, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            const data = response.data;
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
    }, [token]); // Re-fetch when token changes

    return {
        games,
        loading,
        error,
        refetch: fetchGames
    };
};
