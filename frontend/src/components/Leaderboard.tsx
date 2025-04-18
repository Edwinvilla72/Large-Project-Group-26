import React, { useEffect, useState } from 'react';
import '../styles/Leaderboard.css';

type LeaderboardType = 'global' | 'followers';

interface LeaderboardUser {
  username: string;
  level: number;
  xp: number;
}

const Leaderboard: React.FC = () => {
  const [type, setType] = useState<LeaderboardType>('global');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
      })
      .catch(err => {
        console.error("Failed to fetch leaderboard:", err);
      });
  }, []);

  const getRankDisplay = (index: number) => {
    if (index === 0) return '🥇 ';
    if (index === 1) return '🥈 ';
    if (index === 2) return '🥉 ';
    return (index + 1).toString() + " ";
  };

  function back() {
    window.location.href = "/Dashboard";
  }

  // You can filter by followers here if that logic is added
  const filteredUsers = users.slice(0, 20);

  return (
    <div className="leaderboard-container">
      <div className="header">
        <h2>Leaderboard</h2>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as LeaderboardType)}
        >
          <option value="global">Global</option>
          <option value="followers">Followers</option>
        </select>
      </div>
      <ul className="leaderboard-list">
        {filteredUsers.map((user, index) => (
          <li key={user.username} className="leaderboard-item">
            <span className="rank">{getRankDisplay(index)}</span>
            <span className="username">{user.username}</span>
            <span className="xp">{user.xp} XP</span>
          </li>
        ))}
      </ul>        
      <br />
      <button className="button" onClick={back}>Back</button>
    </div>
  );
};

export default Leaderboard;
