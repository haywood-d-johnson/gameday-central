import React, { useEffect, useState } from 'react';
import { testApiConnection } from '../api/config';

export const ApiStatus: React.FC = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    const checkConnection = async () => {
        setIsChecking(true);
        const connected = await testApiConnection();
        setIsConnected(connected);
        setIsChecking(false);
    };

    useEffect(() => {
        checkConnection();
        // Check connection every 30 seconds
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    if (isChecking && isConnected === null) {
        return <div className="api-status checking">Checking API connection...</div>;
    }

    return (
        <div className={`api-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? (
                <span>✅ API Connected</span>
            ) : (
                <div>
                    <span>❌ API Connection Failed</span>
                    <button onClick={checkConnection} disabled={isChecking}>
                        {isChecking ? 'Checking...' : 'Retry Connection'}
                    </button>
                </div>
            )}
        </div>
    );
};
