import React, { useState } from 'react';
import { users, User } from '/home/colorstest/Desktop/Test React/my-new-project/src/data/users';
import './Leaderboard.css';

type LeaderboardType = 'global' | 'followers';

const Leaderboard: React.FC = () => {
  const [type, setType] = useState<LeaderboardType>('global');

  const filteredUsers: User[] = users
    .filter(user => type === 'global' || user.isFollowed)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 20);
  const getRankDisplay = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return (index + 1).toString();
  };

  return (
    <div className="leaderboard-container">
      <div className="header">
        <h2>Leaderboard</h2>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as LeaderboardType)}
        >
<<<<<<< Updated upstream
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
    </div>
  );
};

=======



            
        <div className="neon-login-container">
          <h1 className="neon-title">Leaderboard</h1>
          <p>This is a test!</p>
        </div>
        <br></br>
        <button className="button" onClick={back}>Back</button>






      </motion.div>
    );
}
>>>>>>> Stashed changes
export default Leaderboard;