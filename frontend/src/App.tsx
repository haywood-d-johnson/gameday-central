import React from 'react';
import { GamesList } from './components/GamesList';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import './styles/GamesList.css';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <ThemeToggle />
        <header className="App-header">
          <h1>Game Day Central</h1>
        </header>
        <main>
          <GamesList />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
