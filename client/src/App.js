import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import EventManager from './pages/EventManager';
import Report from './pages/Report';
import Navbar from './components/Navbar';
import { jwtDecode } from 'jwt-decode';

function App() {
  const token = localStorage.getItem('token');
  let username = '';
  if (token) {
    try {
  username = jwtDecode(token).username;
    } catch {}
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<><Navbar username={username} /><EventManager username={username} /></>} />
        <Route path="/report" element={<><Navbar username={username} /><Report username={username} /></>} />
      </Routes>
    </Router>
  );
}

export default App;
