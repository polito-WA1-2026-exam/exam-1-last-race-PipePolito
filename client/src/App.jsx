import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import {InitLayout, NotFoundLayout, RulesLayout, GameLayout} from './components/PageLayout.jsx';
import FeedbackContext from './contexts/FeedbackContext.js';
import { LoginForm } from './components/LoginLayout.jsx';
import { login, getCurrentUser, logout } from './API.js';


function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [user, setUser] = useState({ id: undefined, surname: undefined, name: undefined, email: undefined });

  // Called by LoginForm after successful login
  const handleLogin = async (email, password) => {
    const u = await login(email, password);  // throws on failure
    setUser(u);
  };

  // Called by LogoutButton
  const handleLogout = async () => {
    await logout();
    setUser({ id: undefined, surname: undefined, name: undefined, email: undefined });
  };

  // Restore session on page refresh (Week 10 pattern)
  useEffect(() => {
    getCurrentUser()
      .then(u => setUser(u))
      .catch(() => {});   // not logged in — stay as anonymous
  }, []);

  return (
    <FeedbackContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="/"      element={<InitLayout />} />   {/* home/welcome */}
        <Route path="/login" element={<LoginForm login={loginFn} />} />
        <Route path="/rules" element={<RulesLayout />} />
        <Route path="/game"  element={<GameLayout />} />
        <Route path="*"      element={<NotFoundLayout />} />
      </Routes>
    </FeedbackContext.Provider>
  )
}

export default App
