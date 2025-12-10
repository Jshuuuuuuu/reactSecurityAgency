import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard'); 
  // Options: 'landing', 'login', 'dashboard'
  
  if (currentPage === 'landing') return <LandingPage />;
  if (currentPage === 'login') return <LoginPage />;
  if (currentPage === 'dashboard') return <AdminDashboard />;
}

export default App;