import { users, User } from '../data/users'; // for testing! I need to implement api for this soon
import '../styles/Leaderboard.css';
import React, {useEffect, useState } from 'react';

type LeaderboardType = 'global' | 'followers';

interface LeaderboardUser {
  username: string, 
  level: number;
  xp: number;
}

const Leaderboard: React.FC = () => {
  const [type, setType] = useState<LeaderboardType>('global');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  const getRankDisplay = (index: number) => {
    if (index === 0) return '🥇 ';
    if (index === 1) return '🥈 ';
    if (index === 2) return '🥉 ';
    return (index + 1).toString() + " ";
  };

  function back() {
    // window reload necessary for the models to load back up as things are rn
    // cannot use navigate 
    window.location.href = "/Dashboard"; 
 }

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
      <br></br>
      <button className="button" onClick={back}>Back</button>
    </div>
    
  );
};

export default Leaderboard;
