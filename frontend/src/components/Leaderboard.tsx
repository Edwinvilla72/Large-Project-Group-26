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
  const [error, setError] = useState<string | null>(null);
  const [friendId, setFriendId] = useState('');
  const [addFriendMessage, setAddFriendMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      let url = 'http://localhost:3000/api/leaderboard';

      if (type === 'followers') {
        const userData = localStorage.getItem('user_data');
        if (!userData) {
          setError("User not logged in.");
          return;
        }

        try {
          const parsed = JSON.parse(userData);
          if (!parsed._id) {
            setError("User ID missing.");
            return;
          }

          url = `http://localhost:3000/api/leaderboard/friends/${parsed._id}`;
        } catch (e) {
          setError("Failed to parse user data.");
          return;
        }
      }

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (!Array.isArray(data)) {
          setError(data?.error || "Unexpected server response.");
          setUsers([]);
          return;
        }

        setUsers(data);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not fetch leaderboard.");
        setUsers([]);
      }
    };

    fetchLeaderboard();
  }, [type]);

  const getRankDisplay = (index: number) => {
    if (index === 0) return '🥇 ';
    if (index === 1) return '🥈 ';
    if (index === 2) return '🥉 ';
    return `${index + 1} `;
  };

  const back = () => {
    window.location.href = "/Dashboard";
  };

  const handleAddFriend = async () => {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      setAddFriendMessage("You must be logged in to add a friend.");
      return;
    }

    const parsed = JSON.parse(userData);
    const userId = parsed._id;

    try {
      const response = await fetch('http://localhost:3000/api/addFriend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, friendId })
      });

      const result = await response.json();

      if (!response.ok) {
        setAddFriendMessage(result.error || "Failed to add friend.");
      } else {
        setAddFriendMessage("Friend added successfully!");
        setFriendId('');
      }
    } catch (err) {
      console.error("Add friend error:", err);
      setAddFriendMessage("Error adding friend.");
    }
  };

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
        {error ? (
          <li className="leaderboard-item">{error}</li>
        ) : filteredUsers.length === 0 ? (
          <li className="leaderboard-item">No users to display.</li>
        ) : (
          filteredUsers.map((user, index) => (
            <li key={user.username} className="leaderboard-item">
              <span className="rank">{getRankDisplay(index)}</span>
              <span className="username">{user.username}</span>
              <span className="xp">{user.xp} XP</span>
            </li>
          ))
        )}
      </ul>

      <div className="add-friend-form">
        <input
          type="text"
          placeholder="Enter Friend's User ID"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
        />
        <button onClick={handleAddFriend} className="button">Add Friend</button>
        {addFriendMessage && <p style={{ color: 'white' }}>{addFriendMessage}</p>}
      </div>

      <br />
      <button className="button" onClick={back}>Back</button>
    </div>
  );
};

export default Leaderboard;
