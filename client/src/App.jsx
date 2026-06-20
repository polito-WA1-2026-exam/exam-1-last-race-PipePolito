import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import {InitLayout, NotFoundLayout, RulesLayout} from './components/PageLayout.jsx';
import FeedbackContext from './contexts/FeedbackContext.js';
import { LoginForm } from './components/LoginLayout.jsx';
import { login, getCurrentUser, logout } from './API.js';


function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [user, setUser] = useState({ id: undefined, surname: undefined, name: undefined, email: undefined });
  const [loggedIn, setLoggedIn] = useState(false);
  const [feedback, setFeedback] = useState('');

  const setFeedbackFromError = (err) => {
        let message = '';
        if (err.message) message = err.message;
        else message = "Unknown Error";
        setFeedback(message); // Assuming only one error message at a time
    };

  // Called by LoginForm after successful login
  const handleLogin = async ({ email, password }) => {
      const user = await login(email, password);
      setUser(user); setLoggedIn(true);
      setFeedback("Welcome, " + user.name + " " + user.surname + "!");
  };

  // Called by LogoutButton
  const handleLogout = async () => {
    await logout();
    setUser({ id: undefined, surname: undefined, name: undefined, email: undefined });
  };

  // Restore session on page refresh (Week 10 pattern)
  useEffect(() => {
    getCurrentUser()
      .then(u => { 
        setLoggedIn(true);
        setUser(u);
    }).catch(e => {
      if(loggedIn)
        setFeedbackFromError(e);
      setLoggedIn(false); setUser(null);
    });   // not logged in — stay as anonymous
  }, []);

  return (
    <FeedbackContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="/"      element={<InitLayout />} />   {/* home/welcome */}
        <Route path="/login" element={<LoginForm login={handleLogin} />} />
        <Route path="/rules" element={<RulesLayout />} />
        
        <Route path="*"      element={<NotFoundLayout />} />
      </Routes>
    </FeedbackContext.Provider>
  )
}

export default App

//<Route path="/game"  element={<GameLayout />} />