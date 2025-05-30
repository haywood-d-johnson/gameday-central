import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeToggle } from './components/ThemeToggle';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { GamesList } from './components/GamesList';
import { Toaster } from 'react-hot-toast';
import './styles/GamesList.css';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="App">
            <ThemeToggle />
            <header className="App-header">
              <h1>Game Day Central</h1>
            </header>
            <main>
              <Routes>
                <Route path="/games" element={<GamesList />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
            <Toaster position="top-right" />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
