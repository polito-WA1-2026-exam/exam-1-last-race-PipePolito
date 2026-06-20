import db from "./db.js";

export default function GameDao() {
  // Retrieve the list of stations
  this.listStations = () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT name FROM stations";
      db.all(sql, [], (err, rows) => {
        if(err)
          reject(err);
        else {
          const stations = rows.map((s => s.name));
          resolve(stations);
        }
      });
    });
  }

  // Retrieve the game by ID
  this.getGame = (id) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT id, user_id, start_station_id, end_station_id, status, final_coins, created_at, time_spent FROM games WHERE id = ?";
      db.get(sql, [id], (err, row) => {
        if(err)
          reject(err);
        else if(row !== undefined)
          resolve({ id: row.id, userId: row.user_id, startId: row.start_station_id, endId: row.end_station_id, status: row.status, score: row.final_coins, created: row.created_at, time: row.time_spent });
        else
          resolve({error: "Game not available, check the id."});
      });
    });
  }

  // Add a new game
  this.addGame = (game) => {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO games(user_id, start_station_id, end_station_id, status, final_coins, created_at, time_spent) VALUES (?,?,?,?,?,?,?)";
      db.run(sql, [game.userId, game.startId, game.endId, game.status, game.score, game.created, game.time], function(err) {
        if(err) reject (err);
        else resolve(this.lastID);
      });
    });
  }

  // Update the time spent
  this.updateTime = (game) => {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE games SET time_spent = ? WHERE id = ?";
      db.run(sql, [game.time, game.id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  };


    // Pick a valid start + end (at least 3 connections apart) using BFS
  this.pickStartAndEnd = () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT station_1_id, station_2_id FROM connections", [], (err, rows) => {
        if (err) { reject(err); return; }

        // Build undirected adjacency list
        const adj = {};
        rows.forEach(r => {
          if (!adj[r.station_1_id]) adj[r.station_1_id] = [];
          if (!adj[r.station_2_id]) adj[r.station_2_id] = [];
          adj[r.station_1_id].push(r.station_2_id);
          adj[r.station_2_id].push(r.station_1_id);
        });

        const ids = Object.keys(adj).map(Number);

        const tryPick = () => {
          const startId = ids[Math.floor(Math.random() * ids.length)];

          // BFS from start — find distances to all other stations
          const dist = { [startId]: 0 };
          const queue = [startId];
          while (queue.length) {
            const curr = queue.shift();
            for (const nb of adj[curr] || []) {
              if (dist[nb] === undefined) { dist[nb] = dist[curr] + 1; queue.push(nb); }
            }
          }

          const candidates = ids.filter(id => dist[id] >= 3 && dist[id] <= 8);
          if (candidates.length === 0) return tryPick(); // retry (shouldn't happen with a well-connected network)

          const endId = candidates[Math.floor(Math.random() * candidates.length)];
          resolve({ startId, endId });
        };
        tryPick();
      });
    });
  };


  // Get all events
  this.getAllEvents = () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM events", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };

  //Get Network returning lines + stations + connections
  this.getNetwork = () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT l.id AS line_id, l.line_name,
              s1.id AS station_1_id, s1.name AS station_1_name, s1.is_interchange AS s1_interchange,
              s2.id AS station_2_id, s2.name AS station_2_name, s2.is_interchange AS s2_interchange
        FROM connections c
        JOIN lines l ON c.line_id = l.id
        JOIN stations s1 ON c.station_1_id = s1.id
        JOIN stations s2 ON c.station_2_id = s2.id
        `;

      db.all(sql, [], (err, rows) => {
        if(err)
          reject(err);
        else {
          const network = rows.map(r => ({
            lineId: r.line_id,
            lineName: r.line_name,
            station1Id: r.station_1_id,
            station1Name: r.station_1_name,
            station1IsInterchange: r.s1_interchange,
            station2Id: r.station_2_id,
            station2Name: r.station_2_name,
            station2IsInterchange: r.s2_interchange,
          }));
          resolve(network);
        }
      });
    });
  }

  //Add segments storing players submitted route
  this.addSegments = (gameId, segments) => {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO game_segments(game_id, from_station_id, to_station_id, line_id, segment_order, coin_delta) VALUES (?,?,?,?,?,?)";
      const stmt = db.prepare(sql);
      segments.forEach((segment, index) => {
        stmt.run([gameId, segment.fromStationId, segment.toStationId, segment.lineId, index + 1, segment.coinDelta], (err) => {
          if(err) reject(err);
        });
      });
      stmt.finalize((err) => {
        if(err) reject(err);
        else resolve();
      });
    });
  }

  //Get best scores
  this.getRanking = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.name, u.surname, g.final_coins, g.created_at
      FROM games g JOIN users u ON g.user_id = u.id
      WHERE g.status = 'completed'
      ORDER BY g.final_coins DESC
      LIMIT 10
    `;
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

  // Finalize the game by updating its status and final score
  this.finalizeGame = (gameId, finalScore) => {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE games SET status = 'completed', final_coins = ? WHERE id = ?";
      db.run(sql, [finalScore, gameId], function(err) {
        if(err) reject(err);
        else resolve();
      });
    });
  }
}