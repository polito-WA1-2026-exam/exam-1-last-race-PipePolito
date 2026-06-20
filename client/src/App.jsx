import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import {InitLayout, NotFoundLayout, RulesLayout} from './components/PageLayout.jsx';
import Header from './components/Header.jsx';
import { RankingList } from './components/DisplayRankings.jsx';
import GameLayout from './components/GameLayout.jsx';
import FeedbackContext from './contexts/FeedbackContext.js';
import { LoginForm } from './components/LoginLayout.jsx';
import { login, getCurrentUser, logout, getRanking } from './API.js';


function App() {
  const [user, setUser] = useState({ id: undefined, surname: undefined, name: undefined, email: undefined });
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [ranking, setRanking] = useState([]);

  // Called by LoginForm after successful login
  const handleLogin = async ({ email, password }) => {
      const user = await login(email, password);
      setUser(user); setLoggedIn(true);
      setFeedback("Welcome, " + user.name + " " + user.surname + "!");
  };

  // Called by LogoutButton
  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
    setUser({ id: undefined, surname: undefined, name: undefined, email: undefined });
  };

  // Restore session on page refresh (Week 10 pattern)
  useEffect(() => {
    getCurrentUser()
      .then(u => {
        setLoggedIn(true);
        setUser(u);
        return getRanking();          // fetch ranking only after session confirmed
      })
      .then(rows => setRanking(rows))
      .catch(() => {
        setLoggedIn(false);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <FeedbackContext.Provider value={{ user, setUser }}>
      <Header loggedIn={loggedIn} handleLogout={handleLogout} />
      <Routes>
        <Route path="/"      element={<InitLayout loggedIn={loggedIn} />} />
        <Route path="/login" element={
          loggedIn ? <Navigate replace to='/' />
          : <LoginForm login={handleLogin} />} />
        <Route path="/rules" element={<RulesLayout loggedIn={loggedIn} />} />
        <Route path="/ranking" element={
          !loggedIn ? <Navigate replace to='/login' />
          : <RankingList rankings={ranking}/>}/>
        <Route path="/game" element={
          !loggedIn ? <Navigate replace to='/login' />
          : <GameLayout loggedIn={loggedIn} />}/>
        <Route path="*"      element={<NotFoundLayout />} />
      </Routes>
    </FeedbackContext.Provider>
  )
}

export default App