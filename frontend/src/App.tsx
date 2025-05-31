import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeToggle } from './components/ThemeToggle';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { GamesList } from './components/GamesList';
import { ApiStatus } from './components/ApiStatus';
import MainMenu from './components/MainMenu';
import { Toaster } from 'react-hot-toast';
import './styles/GamesList.css';
import './styles/ApiStatus.css';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
            <MainMenu />
            <div className="container mx-auto px-4 py-8">
              <div className="flex justify-end mb-4">
                <ThemeToggle />
              </div>
              <main>
                <Routes>
                  <Route path="/dashboard" element={<div className="text-center text-2xl">Dashboard Coming Soon</div>} />
                  <Route path="/games" element={<GamesList />} />
                  <Route path="/register" element={<RegisterForm />} />
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/profile" element={<div className="text-center text-2xl">Profile Coming Soon</div>} />
                  <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
              </main>
              <ApiStatus />
              <Toaster position="top-right" />
            </div>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
