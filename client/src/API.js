const SERVER_URL = 'http://localhost:3001';

/** AUTH **/

async function login(email, password) {
  const res = await fetch(`${SERVER_URL}/api/sessions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });
  if (res.ok) return res.json();          // { id, name, surname, username }
  const err = await res.json();
  throw new Error(err.error);
}

async function getCurrentUser() {
  const res = await fetch(`${SERVER_URL}/api/sessions/current`, {
    credentials: 'include',
  });
  if (res.ok) return res.json();
  throw new Error('Not authenticated');
}

async function logout() {
  const res = await fetch(`${SERVER_URL}/api/sessions/current`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.ok) return true;
  throw new Error('Logout failed');
}

/** NETWORK **/

async function getNetwork() {
  const res = await fetch(`${SERVER_URL}/api/network`, {
    credentials: 'include',
  });
  if (res.ok) return res.json();
  const err = await res.json();
  throw new Error(err.error);
}

async function getSegments() {
  const res = await fetch(`${SERVER_URL}/api/segments`, {
    credentials: 'include',
  });
  if (res.ok) return res.json();          // array of { station1, station2 } objects
  const err = await res.json();
  throw new Error(err.error);
}

/** GAME **/

async function startGame() {
  const res = await fetch(`${SERVER_URL}/api/games`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (res.ok) return res.json();          // { id, startStationId, endStationId }
  const err = await res.json();
  throw new Error(err.error);
}

async function getGame(gameId) {
  const res = await fetch(`${SERVER_URL}/api/games/${gameId}`, {
    credentials: 'include',
  });
  if (res.ok) return res.json();
  const err = await res.json();
  throw new Error(err.error);
}

async function updateTimeSpent(gameId, timeSpent) {
  const res = await fetch(`${SERVER_URL}/api/games/${gameId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeSpent }),
  });
  if (res.ok) return true;
  const err = await res.json();
  throw new Error(err.error);
}

// Planning-phase check: ownership, status, and start/end station match only.
async function validateRoute(gameId, startId, endId) {
  const res = await fetch(`${SERVER_URL}/api/games/${gameId}/validate`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startId, endId }),
  });
  if (res.ok) return res.json();
  const err = await res.json();
  throw new Error(err.error);
}

// segments: array of { fromId, toId, lineId }
// timeSpent: number of seconds used during planning phase
async function submitRoute(gameId, segments, timeSpent) {
  const res = await fetch(`${SERVER_URL}/api/games/${gameId}/route`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segments, timeSpent }),
  });
  if (res.ok) return res.json();          // { finalCoins, segments: [{fromStationId, toStationId, lineId, coinDelta, eventName}] }
  const err = await res.json();
  throw new Error(err.error);
}

/** RANKING **/

async function getRanking() {
  const res = await fetch(`${SERVER_URL}/api/ranking`, {
    credentials: 'include',
  });
  if (res.ok) return res.json();          // [{ name + surname, created_at, final_coins, time_spent }]
  const err = await res.json();
  throw new Error(err.error);
}

export { login, getCurrentUser, logout, getNetwork, getSegments, startGame, getGame, updateTimeSpent, validateRoute, submitRoute, getRanking };
