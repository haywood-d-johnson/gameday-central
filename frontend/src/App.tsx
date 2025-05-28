import React from 'react';
import { GamesList } from './components/GamesList';
import './styles/GamesList.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Game Day Central</h1>
      </header>
      <main>
        <GamesList />
      </main>
    </div>
  );
}

export default App;
